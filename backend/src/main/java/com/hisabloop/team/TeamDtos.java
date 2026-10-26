package com.hisabloop.team;

import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.hisabloop.company.MembershipStatus;
import com.hisabloop.company.Role;

public final class TeamDtos {

    private TeamDtos() {
    }

    public record MemberDto(String membershipId, String userId, String fullName, String email, String phone,
            Role role, String teamId, String teamName, String managerMembershipId, String managerName,
            String designation, MembershipStatus status, Instant joinedAt) {
    }

    public record TeamDto(String id, String name, long memberCount) {
    }

    public record InvitationDto(String id, String email, String fullName, Role role, String teamName,
            Instant expiresAt, Instant createdAt) {
    }

    public record MembersResponse(List<MemberDto> members, List<TeamDto> teams, List<InvitationDto> pendingInvitations,
            boolean canManage) {
    }

    public record InviteRequest(@NotBlank @Email @Size(max = 190) String email, @Size(max = 120) String fullName,
            @NotNull Role role, String teamId, String managerMembershipId) {
    }

    /** acceptUrl is only returned when email delivery is not configured, so the admin can share it. */
    public record InviteResponse(InvitationDto invitation, String acceptUrl, boolean emailDelivered) {
    }

    public record UpdateMemberRequest(Role role, String teamId, Boolean clearTeam, String managerMembershipId,
            Boolean clearManager, MembershipStatus status, @Size(max = 80) String designation) {
    }

    public record CreateTeamRequest(@NotBlank @Size(max = 80) String name) {
    }
}
