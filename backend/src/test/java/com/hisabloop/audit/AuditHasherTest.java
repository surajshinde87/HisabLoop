package com.hisabloop.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

import com.hisabloop.company.CompanyRepository;

class AuditHasherTest {

    private static AuditEvent event(String prev, String id, String action, String newStatus) {
        AuditEvent e = new AuditEvent();
        e.setEventId(id);
        e.setCompanyId("c1");
        e.setEntityType("CLAIM");
        e.setEntityId("claim-1");
        e.setAction(action);
        e.setActorUserId("u1");
        e.setActorName("Ravi");
        e.setOccurredAt(Instant.ofEpochMilli(1_760_000_000_123L));
        e.setPreviousStatus("DRAFT");
        e.setNewStatus(newStatus);
        e.setPrevHash(prev);
        e.setHash(AuditHasher.hash(e));
        return e;
    }

    @Test
    void hashIsDeterministicAndCoversEveryField() {
        AuditEvent a = event(AuditHasher.GENESIS, "e1", "CLAIM_CONFIRMED", "CONFIRMED");
        AuditEvent b = event(AuditHasher.GENESIS, "e1", "CLAIM_CONFIRMED", "CONFIRMED");
        assertEquals(a.getHash(), b.getHash());
        assertEquals(64, a.getHash().length());
        AuditEvent changed = event(AuditHasher.GENESIS, "e1", "CLAIM_CONFIRMED", "APPROVED");
        assertNotEquals(a.getHash(), changed.getHash());
    }

    @Test
    void matchesSeedGeneratorFormat() {
        // Same canonical string as scripts/generate_demo_seed.py builds.
        AuditEvent e = event(AuditHasher.GENESIS, "e1", "CLAIM_CONFIRMED", "CONFIRMED");
        String canonical = String.join("|", AuditHasher.GENESIS, "e1", "c1", "CLAIM", "claim-1", "CLAIM_CONFIRMED",
                "u1", "1760000000123", "DRAFT", "CONFIRMED", "");
        assertEquals(com.hisabloop.common.util.Hashing.sha256Hex(canonical), e.getHash());
    }

    @Test
    void verifyDetectsTamperingAndBrokenLinks() {
        AuditEventRepository repo = mock(AuditEventRepository.class);
        AuditService service = new AuditService(repo, mock(CompanyRepository.class), new ObjectMapper(),
                java.time.Clock.systemUTC());

        AuditEvent e1 = event(AuditHasher.GENESIS, "e1", "CLAIM_CREATED", "DRAFT");
        AuditEvent e2 = event(e1.getHash(), "e2", "CLAIM_CONFIRMED", "CONFIRMED");
        List<AuditEvent> chain = new ArrayList<>(List.of(e1, e2));
        when(repo.findByCompanyIdOrderBySeqAsc("c1")).thenReturn(chain);
        assertTrue(service.verify("c1").valid());

        e2.setNewStatus("PAID");   // edited in the database
        AuditService.ChainVerification broken = service.verify("c1");
        assertFalse(broken.valid());
        assertEquals("e2", broken.firstInvalidEventId());

        e2.setNewStatus("CONFIRMED");
        chain.remove(0);           // deleted row
        assertFalse(service.verify("c1").valid());
    }
}
