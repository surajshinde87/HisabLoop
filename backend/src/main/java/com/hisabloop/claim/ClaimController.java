package com.hisabloop.claim;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hisabloop.common.web.PageResponse;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/claims")
public class ClaimController {

    private final ClaimService claims;
    private final ClaimQueryService queries;

    public ClaimController(ClaimService claims, ClaimQueryService queries) {
        this.claims = claims;
        this.queries = queries;
    }

    @GetMapping
    public PageResponse<ClaimDtos.ClaimSummary> list(@PathVariable String companyId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<ClaimStatus> status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String teamId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "false") boolean flagged,
            @RequestParam(required = false) List<ClaimSource> source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        return queries.list(companyId,
                new ClaimFilter(q, status, category, employeeId, teamId, from, to, flagged, source), page, size, sort);
    }

    @GetMapping("/stats")
    public ClaimDtos.ClaimListStats stats(@PathVariable String companyId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String teamId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) List<ClaimSource> source) {
        return queries.stats(companyId, new ClaimFilter(q, List.of(), category, employeeId, teamId, from, to, false,
                source));
    }

    @GetMapping("/{claimId}")
    public ClaimDtos.ClaimDetail get(@PathVariable String companyId, @PathVariable String claimId) {
        return queries.detail(companyId, claimId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClaimDtos.ClaimDetail create(@PathVariable String companyId,
            @Valid @RequestBody ClaimDtos.CreateClaimRequest request) {
        return claims.create(companyId, request);
    }

    @PostMapping("/text")
    @ResponseStatus(HttpStatus.CREATED)
    public ClaimDtos.ClaimDetail createFromText(@PathVariable String companyId,
            @Valid @RequestBody ClaimDtos.TextClaimRequest request) {
        return claims.createFromText(companyId, request);
    }

    @PatchMapping("/{claimId}")
    public ClaimDtos.ClaimDetail update(@PathVariable String companyId, @PathVariable String claimId,
            @Valid @RequestBody ClaimDtos.UpdateClaimRequest request) {
        return claims.update(companyId, claimId, request);
    }

    @PostMapping("/{claimId}/confirm")
    public ClaimDtos.ClaimDetail confirm(@PathVariable String companyId, @PathVariable String claimId) {
        return claims.confirm(companyId, claimId);
    }

    @PostMapping("/{claimId}/submit")
    public ClaimDtos.ClaimDetail submit(@PathVariable String companyId, @PathVariable String claimId) {
        return claims.submit(companyId, claimId);
    }

    @PostMapping("/{claimId}/comments")
    public ClaimDtos.ClaimDetail comment(@PathVariable String companyId, @PathVariable String claimId,
            @Valid @RequestBody ClaimDtos.CommentRequest request) {
        return claims.addComment(companyId, claimId, request);
    }

    @PostMapping("/{claimId}/duplicate-resolution")
    public ClaimDtos.ClaimDetail resolveDuplicate(@PathVariable String companyId, @PathVariable String claimId,
            @Valid @RequestBody ClaimDtos.DuplicateResolutionRequest request) {
        return claims.resolveDuplicate(companyId, claimId, request);
    }

    @PostMapping("/{claimId}/itc-review")
    public ClaimDtos.ClaimDetail reviewItc(@PathVariable String companyId, @PathVariable String claimId,
            @Valid @RequestBody ClaimDtos.ItcReviewRequest request) {
        return claims.reviewItc(companyId, claimId, request);
    }
}
