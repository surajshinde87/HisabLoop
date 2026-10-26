package com.hisabloop.approval;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hisabloop.claim.ClaimDtos;

@RestController
@RequestMapping("/api/v1/companies/{companyId}")
public class ApprovalController {

    private final ApprovalService service;

    public ApprovalController(ApprovalService service) {
        this.service = service;
    }

    @GetMapping("/approvals")
    public List<ApprovalDtos.PendingApproval> inbox(@PathVariable String companyId) {
        return service.inbox(companyId);
    }

    @PostMapping("/claims/{claimId}/approve")
    public ClaimDtos.ClaimDetail approve(@PathVariable String companyId, @PathVariable String claimId,
            @Valid @RequestBody(required = false) ApprovalDtos.ApproveRequest request) {
        return service.approve(companyId, claimId, request);
    }

    @PostMapping("/claims/{claimId}/reject")
    public ClaimDtos.ClaimDetail reject(@PathVariable String companyId, @PathVariable String claimId,
            @Valid @RequestBody ClaimDtos.ReasonRequest request) {
        return service.reject(companyId, claimId, request);
    }

    @PostMapping("/claims/{claimId}/request-changes")
    public ClaimDtos.ClaimDetail requestChanges(@PathVariable String companyId, @PathVariable String claimId,
            @Valid @RequestBody ClaimDtos.ReasonRequest request) {
        return service.requestChanges(companyId, claimId, request);
    }

    @PostMapping("/approvals/bulk")
    public ApprovalDtos.BulkResult bulk(@PathVariable String companyId,
            @Valid @RequestBody ApprovalDtos.BulkApproveRequest request) {
        return service.bulkApprove(companyId, request);
    }
}
