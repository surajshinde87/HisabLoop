package com.hisabloop.auth;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    /** At least 8 characters with a letter and a digit. Max 72 bytes is BCrypt's input limit. */
    public static final String PASSWORD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$";
    public static final String PASSWORD_MESSAGE = "Password must be 8-72 characters and contain a letter and a number";

    private AuthDtos() {
    }

    public record LoginRequest(@NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Size(max = 72) String password) {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Pattern(regexp = PASSWORD_REGEX, message = PASSWORD_MESSAGE) String password,
            @Size(max = 20) String phone,
            @NotBlank @Size(max = 160) String companyName,
            @Size(max = 15) String gstin,
            @Size(max = 80) String city,
            @Size(max = 80) String state,
            @Pattern(regexp = "STARTER|GROWTH|BUSINESS") String plan) {
    }

    public record ForgotPasswordRequest(@NotBlank @Email @Size(max = 190) String email) {
    }

    public record ResetPasswordRequest(@NotBlank @Size(max = 200) String token,
            @NotBlank @Pattern(regexp = PASSWORD_REGEX, message = PASSWORD_MESSAGE) String newPassword) {
    }

    public record AcceptInvitationRequest(@NotBlank @Size(max = 200) String token,
            @Size(max = 120) String fullName,
            @NotBlank @Size(max = 72) String password) {
    }

    public record UserDto(String id, String email, String fullName, String phone, boolean caPartner,
            String firmName) {
    }

    public record WorkspaceDto(String companyId, String companyName, String gstin, String plan, String city,
            String state, String role, String membershipId, String kind, String teamName, String designation,
            List<String> permissions) {
    }

    public record SessionDto(UserDto user, List<WorkspaceDto> workspaces) {
    }

    public record AuthResponse(String accessToken, long expiresIn, SessionDto session) {
    }

    public record AuthConfig(boolean selfRegistrationEnabled) {
    }
}
