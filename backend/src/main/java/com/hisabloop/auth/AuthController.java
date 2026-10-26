package com.hisabloop.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hisabloop.common.error.ApiException;
import com.hisabloop.config.AppProperties;
import com.hisabloop.security.CurrentUser;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    public static final String REFRESH_COOKIE = "hl_refresh";
    private static final String COOKIE_PATH = "/api/v1/auth";

    private final AuthService service;
    private final AppProperties properties;

    public AuthController(AuthService service, AppProperties properties) {
        this.service = service;
        this.properties = properties;
    }

    @GetMapping("/config")
    public AuthDtos.AuthConfig config() {
        return service.config();
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request, HttpServletRequest http,
            HttpServletResponse response) {
        return withCookie(service.login(request, http.getRemoteAddr()), response);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request,
            HttpServletResponse response) {
        return withCookie(service.register(request), response);
    }

    @PostMapping("/accept-invitation")
    public AuthDtos.AuthResponse acceptInvitation(@Valid @RequestBody AuthDtos.AcceptInvitationRequest request,
            HttpServletResponse response) {
        return withCookie(service.acceptInvitation(request), response);
    }

    /**
     * Exchanges the HttpOnly refresh cookie for a new access token (and rotates the cookie).
     * X-Requested-With is required so a cross-site form post cannot trigger it.
     */
    @PostMapping("/refresh")
    public AuthDtos.AuthResponse refresh(@CookieValue(name = REFRESH_COOKIE, required = false) String token,
            @RequestHeader(name = "X-Requested-With", required = false) String requestedWith,
            HttpServletResponse response) {
        requireXhr(requestedWith);
        try {
            return withCookie(service.refresh(token), response);
        } catch (ApiException e) {
            clearCookie(response);
            throw e;
        }
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name = REFRESH_COOKIE, required = false) String token,
            @RequestHeader(name = "X-Requested-With", required = false) String requestedWith,
            HttpServletResponse response) {
        requireXhr(requestedWith);
        service.logout(token);
        clearCookie(response);
    }

    @GetMapping("/me")
    public AuthDtos.SessionDto me() {
        return service.session(CurrentUser.require().userId());
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void forgotPassword(@Valid @RequestBody AuthDtos.ForgotPasswordRequest request, HttpServletRequest http) {
        service.forgotPassword(request, http.getRemoteAddr());
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody AuthDtos.ResetPasswordRequest request) {
        service.resetPassword(request);
    }

    private AuthDtos.AuthResponse withCookie(AuthService.LoginResult result, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, result.refreshToken())
                .httpOnly(true)
                .secure(properties.cookie().secure())
                .sameSite(properties.cookie().sameSite())
                .path(COOKIE_PATH)
                .maxAge(result.refreshTtl())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return result.body();
    }

    private void clearCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(properties.cookie().secure())
                .sameSite(properties.cookie().sameSite())
                .path(COOKIE_PATH)
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private static void requireXhr(String requestedWith) {
        if (requestedWith == null || requestedWith.isBlank()) {
            throw ApiException.badRequest("missing_header", "X-Requested-With header is required");
        }
    }
}
