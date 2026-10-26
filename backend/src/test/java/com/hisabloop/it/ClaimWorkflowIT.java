package com.hisabloop.it;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

/** End-to-end claim lifecycle through the HTTP API against MySQL. */
class ClaimWorkflowIT extends IntegrationTestBase {

    @Test
    void protectedEndpointsRequireAuthentication() throws Exception {
        getJson("/api/v1/companies", null, 401);
        getJson("/api/v1/companies/00000000-0000-0000-0000-000000000000/claims", null, 401);
    }

    @Test
    void fullLifecycleFromDraftToPaidIsPersistedAndAudited() throws Exception {
        Session alice = register("Alice", "Alpha Traders");
        Session bob = inviteAndJoin(alice, "Bob", "EMPLOYEE");

        // Bob creates, confirms and submits a claim
        JsonNode claim = postJson(claimsUrl(bob), bob, newClaim("1240.00", "Uber India", "2026-10-08"), 201);
        String claimId = claim.path("id").asText();
        assertThat(claim.path("status").asText()).isEqualTo("DRAFT");
        assertThat(claim.path("availableActions").toString()).contains("CONFIRM");

        assertThat(postJson(claimsUrl(bob) + "/" + claimId + "/confirm", bob, null, 200).path("status").asText())
                .isEqualTo("CONFIRMED");
        // invalid transition: confirming twice
        postJson(claimsUrl(bob) + "/" + claimId + "/confirm", bob, null, 409);
        assertThat(postJson(claimsUrl(bob) + "/" + claimId + "/submit", bob, null, 200).path("status").asText())
                .isEqualTo("PENDING_APPROVAL");

        // Bob cannot approve his own claim; Alice (admin) can
        postJson(claimsUrl(bob) + "/" + claimId + "/approve", bob, Map.of(), 403);
        JsonNode inbox = getJson("/api/v1/companies/" + alice.companyId() + "/approvals", alice, 200);
        assertThat(inbox.toString()).contains(claimId);
        JsonNode approved = postJson(claimsUrl(alice) + "/" + claimId + "/approve", alice, Map.of("comment", "ok"), 200);
        assertThat(approved.path("status").asText()).isEqualTo("APPROVED");

        // Batch, bank file, payment
        String batchesUrl = "/api/v1/companies/" + alice.companyId() + "/reimbursement-batches";
        JsonNode batch = postJson(batchesUrl, alice, Map.of("claimIds", List.of(claimId)), 201);
        String batchId = batch.path("batch").path("id").asText();
        assertThat(batch.path("batch").path("totalAmount").decimalValue()).isEqualByComparingTo("1240.00");
        postJson(batchesUrl, alice, Map.of("claimIds", List.of(claimId)), 409);   // no double inclusion

        MvcResult file = mvc.perform(get(batchesUrl + "/" + batchId + "/bank-file")
                .header("Authorization", "Bearer " + alice.token())).andReturn();
        assertThat(file.getResponse().getStatus()).isEqualTo(200);
        assertThat(file.getResponse().getContentType()).startsWith("text/csv");
        String csv = file.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        assertThat(csv).contains("batch_reference,employee_name").contains("1240.00");

        Map<String, Object> paid = Map.of("method", "NEFT", "reference", "UTR123", "paidOn", "2026-10-20");
        postJson(batchesUrl + "/" + batchId + "/mark-paid", alice, paid, 200);
        postJson(batchesUrl + "/" + batchId + "/mark-paid", alice, paid, 409);     // cannot pay twice
        assertThat(getJson(claimsUrl(alice) + "/" + claimId, alice, 200).path("status").asText()).isEqualTo("PAID");

        // Audit trail covers every status change and the chain verifies
        JsonNode audit = getJson("/api/v1/companies/" + alice.companyId() + "/audit-events?entityId=" + claimId
                + "&size=50", alice, 200);
        List<String> actions = new ArrayList<>();
        audit.path("items").forEach(e -> actions.add(e.path("action").asText()));
        assertThat(actions).contains("CLAIM_CREATED", "CLAIM_CONFIRMED", "CLAIM_SUBMITTED", "CLAIM_APPROVED",
                "CLAIM_BATCHED", "CLAIM_PAID");
        assertThat(getJson("/api/v1/companies/" + alice.companyId() + "/audit-events/verify", alice, 200)
                .path("valid").asBoolean()).isTrue();

        // Dashboard aggregates come from the same rows
        JsonNode dash = getJson("/api/v1/companies/" + alice.companyId() + "/dashboard?month=2026-10", alice, 200);
        assertThat(dash.path("totalSpend").path("amount").decimalValue()).isEqualByComparingTo("1240.00");
    }

    @Test
    void rejectionNeedsReasonAndEmployeesOnlySeeTheirOwnClaims() throws Exception {
        Session alice = register("Alice", "Beta Traders");
        Session bob = inviteAndJoin(alice, "Bob", "EMPLOYEE");
        String claimId = submitted(bob, "500.00");

        postJson(claimsUrl(alice) + "/" + claimId + "/reject", alice, Map.of("reason", ""), 400);
        JsonNode rejected = postJson(claimsUrl(alice) + "/" + claimId + "/reject", alice,
                Map.of("reason", "Personal expense"), 200);
        assertThat(rejected.path("status").asText()).isEqualTo("REJECTED");
        // a rejected claim cannot go into a batch
        postJson("/api/v1/companies/" + alice.companyId() + "/reimbursement-batches", alice,
                Map.of("claimIds", List.of(claimId)), 409);

        JsonNode aliceClaim = postJson(claimsUrl(alice), alice, newClaim("300.00", "Cafe", "2026-10-09"), 201);
        getJson(claimsUrl(bob) + "/" + aliceClaim.path("id").asText(), bob, 404);
    }

    @Test
    void textClaimsAndMockOcrReceiptsArePersisted() throws Exception {
        Session alice = register("Alice", "Gamma Traders");
        Session bob = inviteAndJoin(alice, "Bob", "EMPLOYEE");

        JsonNode text = postJson(claimsUrl(bob) + "/text", bob, Map.of("text", "Auto fare 180 cash"), 201);
        assertThat(text.path("status").asText()).isEqualTo("DRAFT");
        assertThat(text.path("hasReceipt").asBoolean()).isFalse();
        assertThat(text.path("totalAmount").decimalValue()).isEqualByComparingTo("180.00");
        assertThat(text.path("flags").toString()).contains("NO_RECEIPT");

        JsonNode draft = postJson(claimsUrl(bob), bob, Map.of("categoryCode", "OTHER", "source", "WHATSAPP"), 201);
        String claimId = draft.path("id").asText();
        byte[] png = new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3, 4};
        MvcResult upload = mvc.perform(multipart(claimsUrl(bob) + "/" + claimId + "/receipts")
                .file(new MockMultipartFile("file", "uber_trip_sample.png", "image/png", png))
                .header("Authorization", "Bearer " + bob.token())).andReturn();
        assertThat(upload.getResponse().getStatus()).isEqualTo(200);
        String receiptId = json.readTree(upload.getResponse().getContentAsString()).path("id").asText();

        JsonNode processed = postJson("/api/v1/companies/" + bob.companyId() + "/receipts/" + receiptId + "/process",
                bob, null, 200);
        assertThat(processed.path("vendorName").asText()).isEqualTo("Uber India Systems Pvt Ltd");
        assertThat(processed.path("totalAmount").decimalValue()).isEqualByComparingTo("1240.00");
        assertThat(processed.path("status").asText()).isEqualTo("DRAFT");   // employee still has to confirm

        // a file that is not an image/PDF is refused regardless of its name
        MvcResult bad = mvc.perform(multipart(claimsUrl(bob) + "/" + claimId + "/receipts")
                .file(new MockMultipartFile("file", "evil.png", "image/png", "<script>".getBytes()))
                .header("Authorization", "Bearer " + bob.token())).andReturn();
        assertThat(bad.getResponse().getStatus()).isEqualTo(400);
    }

    @Test
    void refreshTokenRotatesAndReuseIsRejected() throws Exception {
        Session alice = register("Alice", "Delta Traders");
        MvcResult login = mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                .content(json.writeValueAsBytes(Map.of("email", alice.email(), "password", "Secret123")))).andReturn();
        jakarta.servlet.http.Cookie cookie = login.getResponse().getCookie("hl_refresh");
        assertThat(cookie).isNotNull();
        assertThat(cookie.isHttpOnly()).isTrue();

        MvcResult refreshed = mvc.perform(post("/api/v1/auth/refresh").cookie(cookie)
                .header("X-Requested-With", "XMLHttpRequest")).andReturn();
        assertThat(refreshed.getResponse().getStatus()).isEqualTo(200);
        MvcResult reused = mvc.perform(post("/api/v1/auth/refresh").cookie(cookie)
                .header("X-Requested-With", "XMLHttpRequest")).andReturn();
        assertThat(reused.getResponse().getStatus()).isEqualTo(401);
        MvcResult noHeader = mvc.perform(post("/api/v1/auth/refresh").cookie(cookie)).andReturn();
        assertThat(noHeader.getResponse().getStatus()).isEqualTo(400);
    }

    // ------------------------------------------------------------------ helpers

    protected Session inviteAndJoin(Session admin, String name, String role) throws Exception {
        Map<String, Object> invite = new HashMap<>();
        invite.put("email", name.toLowerCase() + "-" + System.nanoTime() + "@example.test");
        invite.put("fullName", name);
        invite.put("role", role);
        invite.put("managerMembershipId", admin.membershipId());
        JsonNode res = postJson("/api/v1/companies/" + admin.companyId() + "/members/invitations", admin, invite, 201);
        String url = res.path("acceptUrl").asText();
        assertThat(url).contains("token=");
        String token = url.substring(url.indexOf("token=") + 6);
        JsonNode body = postJson("/api/v1/auth/accept-invitation", null,
                Map.of("token", token, "fullName", name, "password", "Secret123"), 200);
        return session(body, (String) invite.get("email"));
    }

    protected Map<String, Object> newClaim(String amount, String vendor, String date) {
        Map<String, Object> m = new HashMap<>();
        m.put("categoryCode", "TRAVEL");
        m.put("vendorName", vendor);
        m.put("receiptDate", date);
        m.put("totalAmount", amount);
        m.put("paymentMode", "UPI");
        return m;
    }

    protected String submitted(Session s, String amount) throws Exception {
        JsonNode c = postJson(claimsUrl(s), s, newClaim(amount, "Vendor " + amount, "2026-10-10"), 201);
        String id = c.path("id").asText();
        postJson(claimsUrl(s) + "/" + id + "/confirm", s, null, 200);
        postJson(claimsUrl(s) + "/" + id + "/submit", s, null, 200);
        return id;
    }
}
