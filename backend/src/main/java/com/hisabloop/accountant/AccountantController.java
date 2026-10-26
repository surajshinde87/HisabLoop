package com.hisabloop.accountant;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AccountantController {

    private final AccountantService service;

    public AccountantController(AccountantService service) {
        this.service = service;
    }

    @GetMapping("/api/v1/accountant/clients")
    public List<AccountantDtos.ClientDto> clients() {
        return service.clients();
    }

    @GetMapping("/api/v1/accountant/clients/{companyId}/summary")
    public AccountantDtos.ClientSummary summary(@PathVariable String companyId) {
        return service.summary(companyId);
    }

    @GetMapping("/api/v1/companies/{companyId}/ca-partners")
    public List<AccountantDtos.CaPartnerDto> partners(@PathVariable String companyId) {
        return service.partners(companyId);
    }

    @PostMapping("/api/v1/companies/{companyId}/ca-partners")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountantDtos.CaPartnerDto grant(@PathVariable String companyId,
            @Valid @RequestBody AccountantDtos.GrantRequest request) {
        return service.grant(companyId, request);
    }

    @DeleteMapping("/api/v1/companies/{companyId}/ca-partners/{relationshipId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable String companyId, @PathVariable String relationshipId) {
        service.revoke(companyId, relationshipId);
    }
}
