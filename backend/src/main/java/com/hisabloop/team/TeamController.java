package com.hisabloop.team;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/companies/{companyId}")
public class TeamController {

    private final TeamService service;

    public TeamController(TeamService service) {
        this.service = service;
    }

    @GetMapping("/members")
    public TeamDtos.MembersResponse members(@PathVariable String companyId) {
        return service.members(companyId);
    }

    @GetMapping("/directory")
    public List<TeamDtos.MemberDto> directory(@PathVariable String companyId) {
        return service.directory(companyId);
    }

    @PostMapping("/members/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamDtos.InviteResponse invite(@PathVariable String companyId,
            @Valid @RequestBody TeamDtos.InviteRequest request) {
        return service.invite(companyId, request);
    }

    @DeleteMapping("/members/invitations/{invitationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable String companyId, @PathVariable String invitationId) {
        service.revokeInvitation(companyId, invitationId);
    }

    @PatchMapping("/members/{membershipId}")
    public TeamDtos.MemberDto update(@PathVariable String companyId, @PathVariable String membershipId,
            @Valid @RequestBody TeamDtos.UpdateMemberRequest request) {
        return service.update(companyId, membershipId, request);
    }

    @PostMapping("/teams")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamDtos.TeamDto createTeam(@PathVariable String companyId,
            @Valid @RequestBody TeamDtos.CreateTeamRequest request) {
        return service.createTeam(companyId, request);
    }
}
