package com.hisabloop.team;

import java.time.Clock;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimService;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.common.util.Hashing;
import com.hisabloop.company.Company;
import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.CompanyRepository;
import com.hisabloop.company.Membership;
import com.hisabloop.company.MembershipRepository;
import com.hisabloop.company.MembershipStatus;
import com.hisabloop.company.Permission;
import com.hisabloop.company.Role;
import com.hisabloop.config.AppProperties;
import com.hisabloop.notification.NotificationRecord;
import com.hisabloop.notification.NotificationService;

@Service
public class TeamService {

    private static final Duration INVITE_TTL = Duration.ofDays(7);

    private final CompanyAccessService accessService;
    private final MembershipRepository memberships;
    private final TeamRepository teams;
    private final InvitationRepository invitations;
    private final CompanyRepository companies;
    private final NotificationService notifications;
    private final AuditService audit;
    private final AppProperties properties;
    private final Clock clock;

    public TeamService(CompanyAccessService accessService, MembershipRepository memberships, TeamRepository teams,
            InvitationRepository invitations, CompanyRepository companies, NotificationService notifications,
            AuditService audit, AppProperties properties, Clock clock) {
        this.accessService = accessService;
        this.memberships = memberships;
        this.teams = teams;
        this.invitations = invitations;
        this.companies = companies;
        this.notifications = notifications;
        this.audit = audit;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public TeamDtos.MembersResponse members(String companyId) {
        CompanyAccess access = accessService.require(companyId, Permission.VIEW_TEAM);
        List<Membership> all = memberships.findAllForCompany(companyId);
        List<Team> companyTeams = teams.findByCompanyIdOrderByName(companyId);
        Map<String, Team> teamById = companyTeams.stream().collect(Collectors.toMap(Team::getId, Function.identity()));
        List<TeamDtos.TeamDto> teamDtos = companyTeams.stream()
                .map(t -> new TeamDtos.TeamDto(t.getId(), t.getName(), all.stream()
                        .filter(m -> m.getTeam() != null && m.getTeam().getId().equals(t.getId()) && m.isActive())
                        .count()))
                .toList();
        List<TeamDtos.InvitationDto> pending = access.has(Permission.MANAGE_TEAM)
                ? invitations.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, "PENDING").stream()
                        .filter(i -> i.getExpiresAt().isAfter(clock.instant()))
                        .map(i -> invitationDto(i, teamById))
                        .toList()
                : List.of();
        return new TeamDtos.MembersResponse(all.stream().map(TeamService::member).toList(), teamDtos, pending,
                access.has(Permission.MANAGE_TEAM));
    }

    @Transactional(readOnly = true)
    public List<TeamDtos.MemberDto> directory(String companyId) {
        // Lightweight list for filters (employee dropdown). Visible to anyone who can view claims.
        accessService.require(companyId, Permission.VIEW_CLAIMS);
        return memberships.findAllForCompany(companyId).stream().map(TeamService::member).toList();
    }

    @Transactional
    public TeamDtos.InviteResponse invite(String companyId, TeamDtos.InviteRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_TEAM);
        if (req.role() == Role.CA_PARTNER) {
            throw ApiException.badRequest("invalid_role",
                    "CA partners are connected through a client relationship, not a membership");
        }
        String email = req.email().trim().toLowerCase();
        boolean alreadyMember = memberships.findAllForCompany(companyId).stream()
                .anyMatch(m -> m.getUser().getEmail().equalsIgnoreCase(email));
        if (alreadyMember) {
            throw ApiException.conflict("already_member", "This person is already a member of the company");
        }
        if (invitations.existsByCompanyIdAndEmailIgnoreCaseAndStatus(companyId, email, "PENDING")) {
            throw ApiException.conflict("already_invited", "An invitation is already pending for this email");
        }
        if (req.teamId() != null) {
            teams.findByIdAndCompanyId(req.teamId(), companyId).orElseThrow(() -> ApiException.notFound("Team"));
        }
        if (req.managerMembershipId() != null) {
            memberships.findByIdAndCompanyId(req.managerMembershipId(), companyId)
                    .orElseThrow(() -> ApiException.notFound("Manager"));
        }

        String token = Hashing.newToken();
        Invitation inv = new Invitation();
        inv.setCompanyId(companyId);
        inv.setEmail(email);
        inv.setFullName(req.fullName());
        inv.setRole(req.role());
        inv.setTeamId(req.teamId());
        inv.setManagerMembershipId(req.managerMembershipId());
        inv.setTokenHash(Hashing.sha256Hex(token));
        inv.setStatus("PENDING");
        inv.setExpiresAt(clock.instant().plus(INVITE_TTL));
        inv.setInvitedByUserId(access.userId());
        invitations.save(inv);

        Company company = companies.findById(companyId).orElseThrow();
        String url = properties.frontendBaseUrl() + "/accept-invitation?token=" + token;
        NotificationRecord sent = notifications.email(companyId, null, email, "INVITATION",
                "You're invited to " + company.getName() + " on HisabLoop",
                access.userName() + " invited you to join " + company.getName() + " on HisabLoop as "
                        + req.role().name().toLowerCase() + ".\n\nAccept the invitation (valid for 7 days):\n" + url);

        audit.record(companyId, "MEMBERSHIP", inv.getId(), email, "MEMBER_INVITED", ClaimService.actor(access), null,
                "PENDING", Map.of("role", req.role().name()));
        Map<String, Team> teamById = teams.findByCompanyIdOrderByName(companyId).stream()
                .collect(Collectors.toMap(Team::getId, Function.identity()));
        boolean delivered = "SENT".equals(sent.getStatus());
        // Only hand the link back when no email provider delivered it, so an admin can share it manually.
        return new TeamDtos.InviteResponse(invitationDto(inv, teamById), delivered ? null : url, delivered);
    }

    @Transactional
    public TeamDtos.MemberDto update(String companyId, String membershipId, TeamDtos.UpdateMemberRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_TEAM);
        Membership m = memberships.findByIdAndCompanyId(membershipId, companyId)
                .orElseThrow(() -> ApiException.notFound("Member"));
        Map<String, Object> changes = new LinkedHashMap<>();
        String prevStatus = m.getStatus().name();

        if (req.role() != null && req.role() != m.getRole()) {
            if (req.role() == Role.CA_PARTNER) {
                throw ApiException.badRequest("invalid_role", "CA_PARTNER is not a membership role");
            }
            if (m.getRole() == Role.ADMIN && req.role() != Role.ADMIN) {
                ensureAnotherAdmin(companyId, m);
            }
            changes.put("role", m.getRole() + " -> " + req.role());
            m.setRole(req.role());
        }
        if (Boolean.TRUE.equals(req.clearTeam())) {
            if (m.getTeam() != null) {
                changes.put("team", m.getTeam().getName() + " -> none");
            }
            m.setTeam(null);
        } else if (req.teamId() != null && (m.getTeam() == null || !m.getTeam().getId().equals(req.teamId()))) {
            Team t = teams.findByIdAndCompanyId(req.teamId(), companyId).orElseThrow(() -> ApiException.notFound("Team"));
            changes.put("team", (m.getTeam() == null ? "none" : m.getTeam().getName()) + " -> " + t.getName());
            m.setTeam(t);
        }
        if (Boolean.TRUE.equals(req.clearManager())) {
            if (m.getManager() != null) {
                changes.put("manager", "cleared");
            }
            m.setManager(null);
        } else if (req.managerMembershipId() != null) {
            if (req.managerMembershipId().equals(m.getId())) {
                throw ApiException.badRequest("invalid_manager", "A member cannot be their own manager");
            }
            Membership mgr = memberships.findByIdAndCompanyId(req.managerMembershipId(), companyId)
                    .orElseThrow(() -> ApiException.notFound("Manager"));
            if (wouldCreateCycle(m, mgr)) {
                throw ApiException.badRequest("invalid_manager", "This would create a reporting cycle");
            }
            if (!Objects.equals(m.getManager() == null ? null : m.getManager().getId(), mgr.getId())) {
                changes.put("manager", mgr.getUser().getFullName());
            }
            m.setManager(mgr);
        }
        if (req.designation() != null) {
            m.setDesignation(req.designation().isBlank() ? null : req.designation().trim());
        }
        if (req.status() != null && req.status() != m.getStatus()) {
            if (m.getId().equals(access.membershipId())) {
                throw ApiException.badRequest("self_deactivation", "You cannot change your own membership status");
            }
            if (req.status() == MembershipStatus.INACTIVE && m.getRole() == Role.ADMIN) {
                ensureAnotherAdmin(companyId, m);
            }
            changes.put("status", m.getStatus() + " -> " + req.status());
            m.setStatus(req.status());
        }
        if (!changes.isEmpty()) {
            String action = changes.containsKey("role") ? "MEMBER_ROLE_CHANGED"
                    : changes.containsKey("status") ? "MEMBER_STATUS_CHANGED" : "MEMBER_UPDATED";
            audit.record(companyId, "MEMBERSHIP", m.getId(), m.getUser().getFullName(), action,
                    ClaimService.actor(access), prevStatus, m.getStatus().name(), changes);
        }
        return member(m);
    }

    @Transactional
    public TeamDtos.TeamDto createTeam(String companyId, TeamDtos.CreateTeamRequest req) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_TEAM);
        String name = req.name().trim();
        boolean exists = teams.findByCompanyIdOrderByName(companyId).stream()
                .anyMatch(t -> t.getName().equalsIgnoreCase(name));
        if (exists) {
            throw ApiException.conflict("team_exists", "A team with this name already exists");
        }
        Team t = new Team();
        t.setCompanyId(companyId);
        t.setName(name);
        teams.save(t);
        audit.record(companyId, "TEAM", t.getId(), name, "TEAM_CREATED", ClaimService.actor(access), null, null, null);
        return new TeamDtos.TeamDto(t.getId(), t.getName(), 0);
    }

    @Transactional
    public void revokeInvitation(String companyId, String invitationId) {
        CompanyAccess access = accessService.require(companyId, Permission.MANAGE_TEAM);
        Invitation inv = invitations.findById(invitationId).filter(i -> i.getCompanyId().equals(companyId))
                .orElseThrow(() -> ApiException.notFound("Invitation"));
        if (!"PENDING".equals(inv.getStatus())) {
            throw ApiException.conflict("not_pending", "Invitation is no longer pending");
        }
        inv.setStatus("REVOKED");
        audit.record(companyId, "MEMBERSHIP", inv.getId(), inv.getEmail(), "INVITATION_REVOKED",
                ClaimService.actor(access), "PENDING", "REVOKED", null);
    }

    private void ensureAnotherAdmin(String companyId, Membership m) {
        long admins = memberships.countByCompanyIdAndRoleAndStatus(companyId, Role.ADMIN, MembershipStatus.ACTIVE);
        if (admins <= 1 && m.isActive()) {
            throw ApiException.conflict("last_admin", "A company must keep at least one active admin");
        }
    }

    private static boolean wouldCreateCycle(Membership member, Membership newManager) {
        Membership cursor = newManager;
        int guard = 0;
        while (cursor != null && guard++ < 50) {
            if (cursor.getId().equals(member.getId())) {
                return true;
            }
            cursor = cursor.getManager();
        }
        return false;
    }

    static TeamDtos.MemberDto member(Membership m) {
        return new TeamDtos.MemberDto(m.getId(), m.getUser().getId(), m.getUser().getFullName(), m.getUser().getEmail(),
                m.getUser().getPhone(), m.getRole(), m.getTeam() == null ? null : m.getTeam().getId(),
                m.getTeam() == null ? null : m.getTeam().getName(),
                m.getManager() == null ? null : m.getManager().getId(),
                m.getManager() == null ? null : m.getManager().getUser().getFullName(), m.getDesignation(),
                m.getStatus(), m.getCreatedAt());
    }

    private static TeamDtos.InvitationDto invitationDto(Invitation i, Map<String, Team> teams) {
        Team t = i.getTeamId() == null ? null : teams.get(i.getTeamId());
        return new TeamDtos.InvitationDto(i.getId(), i.getEmail(), i.getFullName(), i.getRole(),
                t == null ? null : t.getName(), i.getExpiresAt(), i.getCreatedAt());
    }
}
