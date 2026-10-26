package com.hisabloop.audit;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.CompanyRepository;

/**
 * Writes hash-chained audit events. {@link Propagation#MANDATORY} guarantees every event is
 * written in the same transaction as the business change it describes: if either fails, both
 * roll back.
 */
@Service
public class AuditService {

    private final AuditEventRepository repository;
    private final CompanyRepository companies;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public AuditService(AuditEventRepository repository, CompanyRepository companies, ObjectMapper objectMapper,
            Clock clock) {
        this.repository = repository;
        this.companies = companies;
        this.objectMapper = objectMapper.copy().configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
        this.clock = clock;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public AuditEvent record(String companyId, String entityType, String entityId, String entityRef, String action,
            AuditActor actor, String previousStatus, String newStatus, Map<String, ?> metadata) {
        // Serialise chain appends per company.
        companies.findByIdForUpdate(companyId).orElseThrow(() -> ApiException.notFound("Company"));
        String prevHash = repository.findTopByCompanyIdOrderBySeqDesc(companyId)
                .map(AuditEvent::getHash)
                .orElse(AuditHasher.GENESIS);

        AuditEvent e = new AuditEvent();
        e.setEventId(UUID.randomUUID().toString());
        e.setCompanyId(companyId);
        e.setEntityType(entityType);
        e.setEntityId(entityId);
        e.setEntityRef(entityRef);
        e.setAction(action);
        e.setActorUserId(actor.userId());
        e.setActorName(actor.name());
        e.setOccurredAt(Instant.now(clock).truncatedTo(ChronoUnit.MILLIS));
        e.setPreviousStatus(previousStatus);
        e.setNewStatus(newStatus);
        e.setMetadataJson(toJson(metadata));
        e.setPrevHash(prevHash);
        e.setHash(AuditHasher.hash(e));
        return repository.save(e);
    }

    /** Recomputes the company's chain. Detects edited, deleted or re-ordered rows. */
    @Transactional(readOnly = true)
    public ChainVerification verify(String companyId) {
        List<AuditEvent> events = repository.findByCompanyIdOrderBySeqAsc(companyId);
        String expectedPrev = AuditHasher.GENESIS;
        for (AuditEvent e : events) {
            if (!expectedPrev.equals(e.getPrevHash()) || !AuditHasher.hash(e).equals(e.getHash())) {
                return new ChainVerification(false, events.size(), e.getEventId());
            }
            expectedPrev = e.getHash();
        }
        return new ChainVerification(true, events.size(), null);
    }

    private String toJson(Map<String, ?> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialise audit metadata", e);
        }
    }

    public record ChainVerification(boolean valid, int eventsChecked, String firstInvalidEventId) {
    }
}
