package com.hisabloop.audit;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hisabloop.claim.ClaimService;
import com.hisabloop.common.web.PageResponse;
import com.hisabloop.common.web.Pagination;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.Permission;

/** Read-only audit API. There are deliberately no create/update/delete endpoints. */
@RestController
@RequestMapping("/api/v1/companies/{companyId}/audit-events")
public class AuditController {

    private final AuditEventRepository repository;
    private final AuditService auditService;
    private final CompanyAccessService accessService;

    public AuditController(AuditEventRepository repository, AuditService auditService,
            CompanyAccessService accessService) {
        this.repository = repository;
        this.auditService = auditService;
        this.accessService = accessService;
    }

    public record AuditEventDto(String id, long seq, String entityType, String entityId, String entityRef,
            String action, String actorUserId, String actorName, Instant occurredAt, String previousStatus,
            String newStatus, String metadataJson, String hash) {
    }

    @GetMapping
    @Transactional(readOnly = true)
    public PageResponse<AuditEventDto> list(@PathVariable String companyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String actorUserId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String claimRef,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        accessService.require(companyId, Permission.VIEW_AUDIT);
        Specification<AuditEvent> spec = (root, q, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(cb.equal(root.get("companyId"), companyId));
            if (from != null) {
                p.add(cb.greaterThanOrEqualTo(root.get("occurredAt"),
                        from.atStartOfDay(ClaimService.INDIA).toInstant()));
            }
            if (to != null) {
                p.add(cb.lessThan(root.get("occurredAt"),
                        to.plusDays(1).atStartOfDay(ClaimService.INDIA).toInstant()));
            }
            if (actorUserId != null && !actorUserId.isBlank()) {
                p.add(cb.equal(root.get("actorUserId"), actorUserId));
            }
            if (action != null && !action.isBlank()) {
                p.add(cb.equal(root.get("action"), action));
            }
            if (entityType != null && !entityType.isBlank()) {
                p.add(cb.equal(root.get("entityType"), entityType));
            }
            if (entityId != null && !entityId.isBlank()) {
                p.add(cb.equal(root.get("entityId"), entityId));
            }
            if (claimRef != null && !claimRef.isBlank()) {
                String ref = claimRef.trim().toUpperCase().replaceFirst("^#", "");
                if (!ref.startsWith("HL-")) {
                    ref = "HL-" + ref;
                }
                p.add(cb.equal(root.get("entityRef"), ref));
            }
            return cb.and(p.toArray(Predicate[]::new));
        };
        var pageable = Pagination.of(page, size, null, Map.of(), Sort.by(Sort.Direction.DESC, "seq"));
        return PageResponse.of(repository.findAll(spec, pageable),
                e -> new AuditEventDto(e.getEventId(), e.getSeq(), e.getEntityType(), e.getEntityId(),
                        e.getEntityRef(), e.getAction(), e.getActorUserId(), e.getActorName(), e.getOccurredAt(),
                        e.getPreviousStatus(), e.getNewStatus(), e.getMetadataJson(), e.getHash()));
    }

    /** Recomputes the hash chain to detect tampering at the database level. */
    @GetMapping("/verify")
    public AuditService.ChainVerification verify(@PathVariable String companyId) {
        accessService.require(companyId, Permission.VIEW_AUDIT);
        return auditService.verify(companyId);
    }
}
