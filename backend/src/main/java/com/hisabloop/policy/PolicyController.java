package com.hisabloop.policy;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PolicyController {

    private final PolicyService service;

    public PolicyController(PolicyService service) {
        this.service = service;
    }

    @GetMapping("/api/v1/categories")
    public List<PolicyDtos.CategoryDto> categories() {
        return service.categories();
    }

    @GetMapping("/api/v1/companies/{companyId}/policies")
    public PolicyDtos.PolicyDto get(@PathVariable String companyId) {
        return service.get(companyId);
    }

    @PutMapping("/api/v1/companies/{companyId}/policies")
    public PolicyDtos.PolicyDto update(@PathVariable String companyId,
            @Valid @RequestBody PolicyDtos.UpdatePolicyRequest request) {
        return service.update(companyId, request);
    }
}
