package com.hisabloop.reimbursement;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/reimbursement-batches")
public class ReimbursementController {

    private final ReimbursementService service;

    public ReimbursementController(ReimbursementService service) {
        this.service = service;
    }

    @GetMapping
    public List<ReimbursementDtos.BatchSummary> list(@PathVariable String companyId) {
        return service.list(companyId);
    }

    @GetMapping("/eligible-claims")
    public ReimbursementDtos.EligibleClaims eligible(@PathVariable String companyId) {
        return service.eligible(companyId);
    }

    @GetMapping("/capabilities")
    public ReimbursementDtos.PayoutCapabilities capabilities(@PathVariable String companyId) {
        return service.capabilities();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReimbursementDtos.BatchDetail create(@PathVariable String companyId,
            @Valid @RequestBody ReimbursementDtos.CreateBatchRequest request) {
        return service.create(companyId, request);
    }

    @GetMapping("/{batchId}")
    public ReimbursementDtos.BatchDetail get(@PathVariable String companyId, @PathVariable String batchId) {
        return service.get(companyId, batchId);
    }

    @GetMapping("/{batchId}/bank-file")
    public ResponseEntity<byte[]> bankFile(@PathVariable String companyId, @PathVariable String batchId) {
        ReimbursementService.BankFile file = service.bankFile(companyId, batchId);
        return ResponseEntity.ok()
                .contentType(new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.filename()).build().toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(file.content());
    }

    @PostMapping("/{batchId}/mark-paid")
    public ReimbursementDtos.BatchDetail markPaid(@PathVariable String companyId, @PathVariable String batchId,
            @Valid @RequestBody ReimbursementDtos.MarkPaidRequest request) {
        return service.markPaid(companyId, batchId, request);
    }
}
