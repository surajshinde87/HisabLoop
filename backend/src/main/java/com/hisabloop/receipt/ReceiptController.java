package com.hisabloop.receipt;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hisabloop.claim.ClaimDtos;

@RestController
@RequestMapping("/api/v1/companies/{companyId}")
public class ReceiptController {

    private final ReceiptService service;

    public ReceiptController(ReceiptService service) {
        this.service = service;
    }

    @PostMapping(path = "/claims/{claimId}/receipts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ClaimDtos.ReceiptDto upload(@PathVariable String companyId, @PathVariable String claimId,
            @RequestParam("file") MultipartFile file) {
        return service.upload(companyId, claimId, file);
    }

    @GetMapping("/receipts/{receiptId}")
    public ClaimDtos.ReceiptDto get(@PathVariable String companyId, @PathVariable String receiptId) {
        return service.get(companyId, receiptId);
    }

    @PostMapping("/receipts/{receiptId}/process")
    public ClaimDtos.ClaimDetail process(@PathVariable String companyId, @PathVariable String receiptId) {
        return service.process(companyId, receiptId);
    }

    /** Streams the stored file after the same visibility checks as the claim itself. */
    @GetMapping("/receipts/{receiptId}/file")
    public ResponseEntity<byte[]> file(@PathVariable String companyId, @PathVariable String receiptId) {
        ReceiptService.ReceiptFile f = service.download(companyId, receiptId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(f.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(f.filename()).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .body(f.content());
    }
}
