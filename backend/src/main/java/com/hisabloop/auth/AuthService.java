package com.hisabloop.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.audit.AuditActor;
import com.hisabloop.audit.AuditService;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.common.util.Hashing;
import com.hisabloop.company.CompanyDtos;
import com.hisabloop.company.CompanyService;
import com.hisabloop.company.Membership;
import com.hisabloop.company.MembershipRepository;
import com.hisabloop.company.MembershipStatus;
import com.hisabloop.config.AppProperties;
import com.hisabloop.notification.NotificationService;
import com.hisabloop.security.JwtService;
import com.hisabloop.security.RateLimiter;
import com.hisabloop.team.Invitation;
import com.hisabloop.team.InvitationRepository;
import com.hisabloop.team.TeamRepository;
import com.hisabloop.user.User;
import com.hisabloop.user.UserRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final Duration RESET_TTL = Duration.ofMinutes(30);
    /** Used to keep login timing similar whether or not the email exists. */
    private static final String DUMMY_HASH = "$2a$12$IfEkQzmB3FRjjuq6eFK6i./febQmrCDQmfkt88nmjtM2nWbom6.bu";

    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final InvitationRepository invitations;
    private final MembershipRepository memberships;
    private final TeamRepository teams;
    private final CompanyService companyService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService notifications;
    private final AuditService audit;
    private final RateLimiter rateLimiter;
    private final AppProperties properties;
    private final Clock clock;

    public AuthService(UserRepository users, RefreshTokenRepository refreshTokens,
            PasswordResetTokenRepository resetTokens, InvitationRepository invitations,
            MembershipRepository memberships, TeamRepository teams,
            CompanyService companyService, PasswordEncoder passwordEncoder, JwtService jwtService,
            NotificationService notifications, AuditService audit, RateLimiter rateLimiter, AppProperties properties,
            Clock clock) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.resetTokens = resetTokens;
        this.invitations = invitations;
        this.memberships = memberships;
        this.teams = teams;
        this.companyService = companyService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.notifications = notifications;
        this.audit = audit;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public LoginResult login(AuthDtos.LoginRequest req, String clientIp) {
        String email = req.email().trim().toLowerCase();
        if (!rateLimiter.tryAcquire("login:" + email, 10, Duration.ofMinutes(15))
                || !rateLimiter.tryAcquire("login-ip:" + clientIp, 50, Duration.ofMinutes(15))) {
            throw ApiException.tooManyRequests("Too many login attempts. Try again in a few minutes.");
        }
        Optional<User> user = users.findByEmailIgnoreCase(email);
        String hash = user.map(User::getPasswordHash).orElse(DUMMY_HASH);
        boolean matches = passwordEncoder.matches(req.password(), hash);
        if (user.isEmpty() || !matches) {
            throw ApiException.unauthorized("Incorrect email or password");
        }
        User u = user.get();
        if (!u.isActive()) {
            throw ApiException.unauthorized("This account is deactivated. Contact your company admin.");
        }
        rateLimiter.reset("login:" + email);
        u.setLastLoginAt(clock.instant());
        return issue(u);
    }

    @Transactional
    public LoginResult register(AuthDtos.RegisterRequest req) {
        if (!properties.auth().selfRegistrationEnabled()) {
            throw ApiException.forbidden("Self-service registration is disabled. Contact HisabLoop to onboard your company.");
        }
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("email_taken", "An account with this email already exists. Log in instead.");
        }
        User u = new User();
        u.setEmail(email);
        u.setFullName(req.fullName().trim());
        u.setPhone(req.phone());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setActive(true);
        users.saveAndFlush(u);
        companyService.onboard(u, new CompanyDtos.CreateCompanyRequest(req.companyName(), null, req.gstin(), email,
                req.phone(), req.city(), req.state(), req.plan()));
        return issue(u);
    }

    /** Rotates the refresh token. Re-use of a revoked token revokes every session of that user. */
    @Transactional(noRollbackFor = ApiException.class)
    public LoginResult refresh(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw ApiException.unauthorized("Session expired. Please log in again.");
        }
        RefreshToken token = refreshTokens.findByTokenHash(Hashing.sha256Hex(rawToken))
                .orElseThrow(() -> ApiException.unauthorized("Session expired. Please log in again."));
        Instant now = clock.instant();
        if (token.getRevokedAt() != null) {
            log.warn("Refresh token reuse detected for user {}; revoking all sessions", token.getUserId());
            refreshTokens.revokeAllForUser(token.getUserId(), now);
            throw ApiException.unauthorized("Session expired. Please log in again.");
        }
        if (token.getExpiresAt().isBefore(now)) {
            throw ApiException.unauthorized("Session expired. Please log in again.");
        }
        token.setRevokedAt(now);
        User u = users.findById(token.getUserId()).filter(User::isActive)
                .orElseThrow(() -> ApiException.unauthorized("Session expired. Please log in again."));
        return issue(u);
    }

    @Transactional
    public void logout(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        refreshTokens.findByTokenHash(Hashing.sha256Hex(rawToken)).ifPresent(t -> {
            if (t.getRevokedAt() == null) {
                t.setRevokedAt(clock.instant());
            }
        });
    }

    @Transactional(readOnly = true)
    public AuthDtos.SessionDto session(String userId) {
        User u = users.findById(userId).filter(User::isActive)
                .orElseThrow(() -> ApiException.unauthorized("Authentication required"));
        return new AuthDtos.SessionDto(userDto(u), companyService.workspaces(u.getId()));
    }

    /** Always succeeds from the caller's point of view so account existence is not revealed. */
    @Transactional
    public void forgotPassword(AuthDtos.ForgotPasswordRequest req, String clientIp) {
        String email = req.email().trim().toLowerCase();
        if (!rateLimiter.tryAcquire("forgot:" + email, 3, Duration.ofHours(1))
                || !rateLimiter.tryAcquire("forgot-ip:" + clientIp, 20, Duration.ofHours(1))) {
            return;
        }
        users.findByEmailIgnoreCase(email).filter(User::isActive).ifPresent(u -> {
            String token = Hashing.newToken();
            PasswordResetToken t = new PasswordResetToken();
            t.setUserId(u.getId());
            t.setTokenHash(Hashing.sha256Hex(token));
            t.setExpiresAt(clock.instant().plus(RESET_TTL));
            resetTokens.save(t);
            String url = properties.frontendBaseUrl() + "/reset-password?token=" + token;
            notifications.email(null, u.getId(), u.getEmail(), "PASSWORD_RESET", "Reset your HisabLoop password",
                    "Use this link within 30 minutes to set a new password:\n" + url
                            + "\n\nIf you did not ask for this, you can ignore this email.");
        });
    }

    @Transactional
    public void resetPassword(AuthDtos.ResetPasswordRequest req) {
        PasswordResetToken t = resetTokens.findByTokenHash(Hashing.sha256Hex(req.token()))
                .orElseThrow(() -> ApiException.badRequest("invalid_token", "This reset link is invalid or has expired"));
        Instant now = clock.instant();
        if (t.getUsedAt() != null || t.getExpiresAt().isBefore(now)) {
            throw ApiException.badRequest("invalid_token", "This reset link is invalid or has expired");
        }
        User u = users.findById(t.getUserId()).orElseThrow(() -> ApiException.badRequest("invalid_token",
                "This reset link is invalid or has expired"));
        u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        t.setUsedAt(now);
        refreshTokens.revokeAllForUser(u.getId(), now);
    }

    @Transactional
    public LoginResult acceptInvitation(AuthDtos.AcceptInvitationRequest req) {
        Invitation inv = invitations.findByTokenHash(Hashing.sha256Hex(req.token()))
                .orElseThrow(() -> ApiException.badRequest("invalid_token", "This invitation is invalid or has expired"));
        Instant now = clock.instant();
        if (!"PENDING".equals(inv.getStatus()) || inv.getExpiresAt().isBefore(now)) {
            throw ApiException.badRequest("invalid_token", "This invitation is invalid or has expired");
        }
        User u = users.findByEmailIgnoreCase(inv.getEmail()).orElse(null);
        if (u == null) {
            if (!req.password().matches(AuthDtos.PASSWORD_REGEX)) {
                throw ApiException.badRequest("weak_password", AuthDtos.PASSWORD_MESSAGE);
            }
            String name = req.fullName() != null && !req.fullName().isBlank() ? req.fullName().trim()
                    : inv.getFullName() != null ? inv.getFullName() : inv.getEmail();
            u = new User();
            u.setEmail(inv.getEmail());
            u.setFullName(name);
            u.setPasswordHash(passwordEncoder.encode(req.password()));
            u.setActive(true);
            users.saveAndFlush(u);
        } else if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
            // Existing account: prove ownership with the current password.
            throw ApiException.unauthorized("Enter the current password of your existing HisabLoop account");
        }
        if (memberships.findByUserIdAndCompanyId(u.getId(), inv.getCompanyId()).isPresent()) {
            throw ApiException.conflict("already_member", "You are already a member of this company");
        }
        Membership m = new Membership();
        m.setUser(u);
        m.setCompanyId(inv.getCompanyId());
        m.setRole(inv.getRole());
        m.setStatus(MembershipStatus.ACTIVE);
        if (inv.getTeamId() != null) {
            teams.findByIdAndCompanyId(inv.getTeamId(), inv.getCompanyId()).ifPresent(m::setTeam);
        }
        if (inv.getManagerMembershipId() != null) {
            memberships.findByIdAndCompanyId(inv.getManagerMembershipId(), inv.getCompanyId()).ifPresent(m::setManager);
        }
        memberships.save(m);
        inv.setStatus("ACCEPTED");
        inv.setAcceptedAt(now);
        audit.record(inv.getCompanyId(), "MEMBERSHIP", m.getId(), u.getFullName(), "MEMBER_JOINED",
                new AuditActor(u.getId(), u.getFullName()), null, MembershipStatus.ACTIVE.name(),
                Map.of("role", inv.getRole().name()));
        return issue(u);
    }

    public AuthDtos.AuthConfig config() {
        return new AuthDtos.AuthConfig(properties.auth().selfRegistrationEnabled());
    }

    private LoginResult issue(User u) {
        String raw = Hashing.newToken();
        RefreshToken rt = new RefreshToken();
        rt.setUserId(u.getId());
        rt.setTokenHash(Hashing.sha256Hex(raw));
        rt.setExpiresAt(clock.instant().plus(properties.jwt().refreshTokenTtl()));
        refreshTokens.save(rt);
        String access = jwtService.issueAccessToken(u.getId(), u.getEmail());
        AuthDtos.AuthResponse body = new AuthDtos.AuthResponse(access, jwtService.accessTokenTtlSeconds(),
                new AuthDtos.SessionDto(userDto(u), companyService.workspaces(u.getId())));
        return new LoginResult(body, raw, properties.jwt().refreshTokenTtl());
    }

    static AuthDtos.UserDto userDto(User u) {
        return new AuthDtos.UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getPhone(), u.isCaPartner(),
                u.getFirmName());
    }

    /** Response body plus the raw refresh token that the controller puts in an HttpOnly cookie. */
    public record LoginResult(AuthDtos.AuthResponse body, String refreshToken, Duration refreshTtl) {
    }
}
