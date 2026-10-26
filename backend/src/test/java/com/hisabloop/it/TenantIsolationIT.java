package com.hisabloop.it;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

/** One company can never read or change another company's data; CA access is explicit and revocable. */
class TenantIsolationIT extends IntegrationTestBase {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void companyCannotReadOrModifyAnotherCompanysClaims() throws Exception {
        Session alice = register("Alice", "Company A");
        Session carol = register("Carol", "Company B");
        JsonNode claim = postJson(claimsUrl(alice), alice, Map.of("categoryCode", "TRAVEL", "vendorName", "Uber",
                "receiptDate", "2026-10-08", "totalAmount", "100.00"), 201);
        String id = claim.path("id").asText();
        String aClaims = claimsUrl(alice);

        getJson(aClaims, carol, 404);
        getJson(aClaims + "/" + id, carol, 404);
        postJson(aClaims + "/" + id + "/confirm", carol, null, 404);
        postJson(aClaims + "/" + id + "/approve", carol, Map.of(), 404);
        postJson(aClaims, carol, Map.of("categoryCode", "TRAVEL"), 404);
        postJson("/api/v1/companies/" + alice.companyId() + "/reimbursement-batches", carol,
                Map.of("claimIds", List.of(id)), 404);
        getJson("/api/v1/companies/" + alice.companyId() + "/reports/gst", carol, 404);
        getJson("/api/v1/companies/" + alice.companyId() + "/audit-events", carol, 404);

        // Carol's own list does not contain Alice's claim even with a forged filter
        JsonNode carolList = getJson(claimsUrl(carol) + "?q=" + claim.path("reference").asText(), carol, 200);
        assertThat(carolList.path("totalItems").asLong()).isZero();

        // Alice's claim is unchanged
        assertThat(getJson(aClaims + "/" + id, alice, 200).path("status").asText()).isEqualTo("DRAFT");
    }

    @Test
    void caPartnerOnlyReachesExplicitlyLinkedClients() throws Exception {
        Session alice = register("Alice", "Client A");
        Session carol = register("Carol", "Client B");

        String caId = UUID.randomUUID().toString();
        String caEmail = "ca-" + caId.substring(0, 8) + "@example.test";
        jdbc.update("INSERT INTO users (id, email, password_hash, full_name, is_active, is_ca_partner, firm_name, "
                + "created_at, updated_at) VALUES (?, ?, ?, 'Priya CA', 1, 1, 'Kulkarni & Associates', NOW(6), NOW(6))",
                caId, caEmail, passwordEncoder.encode("Secret123"));

        Map<String, Object> grant = new HashMap<>();
        grant.put("email", caEmail);
        JsonNode rel = postJson("/api/v1/companies/" + alice.companyId() + "/ca-partners", alice, grant, 201);

        Session ca = login(caEmail, "Secret123");
        JsonNode clients = getJson("/api/v1/accountant/clients", ca, 200);
        assertThat(clients.size()).isEqualTo(1);
        assertThat(clients.get(0).path("companyId").asText()).isEqualTo(alice.companyId());

        getJson(claimsUrl(alice), ca, 200);
        getJson("/api/v1/companies/" + alice.companyId() + "/reports/gst", ca, 200);
        getJson("/api/v1/companies/" + carol.companyId() + "/claims", ca, 404);
        getJson("/api/v1/accountant/clients/" + carol.companyId() + "/summary", ca, 404);
        // read-only: CA partners cannot create claims or change policy
        postJson(claimsUrl(alice), ca, Map.of("categoryCode", "TRAVEL"), 403);
        getJson("/api/v1/companies/" + alice.companyId() + "/audit-events", ca, 403);  // audit not granted

        // revoke and the access is gone immediately
        call(delete("/api/v1/companies/" + alice.companyId() + "/ca-partners/" + rel.path("relationshipId").asText()),
                alice, null, 204);
        getJson(claimsUrl(alice), ca, 404);
    }

    @Test
    void contactFormValidatesAndStoresRequests() throws Exception {
        postJson("/api/v1/public/contact", null, Map.of("fullName", "A", "email", "not-an-email", "topic", "DEMO",
                "message", "Hello there, we have 20 staff"), 400);
        JsonNode ok = postJson("/api/v1/public/contact", null, Map.of("fullName", "Asha", "email", "asha@example.test",
                "topic", "DEMO", "message", "Hello there, we have 20 staff"), 201);
        assertThat(ok.path("id").asText()).isNotBlank();
        Integer stored = jdbc.queryForObject("SELECT COUNT(*) FROM contact_requests WHERE id = ?", Integer.class,
                ok.path("id").asText());
        assertThat(stored).isEqualTo(1);
    }
}
