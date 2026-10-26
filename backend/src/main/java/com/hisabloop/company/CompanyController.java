package com.hisabloop.company;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hisabloop.auth.AuthDtos;
import com.hisabloop.security.CurrentUser;

@RestController
public class CompanyController {

    private final CompanyService service;

    public CompanyController(CompanyService service) {
        this.service = service;
    }

    /** Companies the caller can open (memberships and CA client relationships). */
    @GetMapping("/api/v1/companies")
    public List<AuthDtos.WorkspaceDto> list() {
        return service.workspaces(CurrentUser.require().userId());
    }

    @PostMapping("/api/v1/companies")
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyDtos.CompanyDto create(@Valid @RequestBody CompanyDtos.CreateCompanyRequest request) {
        return service.create(request);
    }

    @GetMapping("/api/v1/companies/{companyId}")
    public CompanyDtos.CompanyDto get(@PathVariable String companyId) {
        return service.get(companyId);
    }

    @PatchMapping("/api/v1/companies/{companyId}")
    public CompanyDtos.CompanyDto update(@PathVariable String companyId,
            @Valid @RequestBody CompanyDtos.UpdateCompanyRequest request) {
        return service.update(companyId, request);
    }

    @GetMapping("/api/v1/public/plans")
    public List<CompanyDtos.PlanDto> plans() {
        return service.plans();
    }
}
