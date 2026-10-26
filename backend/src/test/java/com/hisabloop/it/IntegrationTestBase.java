package com.hisabloop.it;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Boots the full application against a real MySQL 8 (Testcontainers) with Flyway migrations and
 * schema validation. Skipped automatically when Docker is not available.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
abstract class IntegrationTestBase {

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4")
            .withCommand("--log-bin-trust-function-creators=1");

    @Autowired
    protected MockMvc mvc;

    @Autowired
    protected ObjectMapper json;

    @Autowired
    protected JdbcTemplate jdbc;

    /** Registers a new company + admin and returns the session. */
    protected Session register(String name, String company) throws Exception {
        String email = name.toLowerCase() + "-" + UUID.randomUUID().toString().substring(0, 8) + "@example.test";
        JsonNode body = call(post("/api/v1/auth/register"), null, Map.of("fullName", name, "email", email,
                "password", "Secret123", "companyName", company, "plan", "GROWTH"), 201);
        return session(body, email);
    }

    protected Session login(String email, String password) throws Exception {
        JsonNode body = call(post("/api/v1/auth/login"), null, Map.of("email", email, "password", password), 200);
        return session(body, email);
    }

    protected Session session(JsonNode body, String email) {
        JsonNode ws = body.path("session").path("workspaces");
        String companyId = ws.size() > 0 ? ws.get(0).path("companyId").asText() : null;
        String membershipId = ws.size() > 0 ? ws.get(0).path("membershipId").asText(null) : null;
        return new Session(body.path("accessToken").asText(), companyId, membershipId, email);
    }

    protected JsonNode call(MockHttpServletRequestBuilder req, Session s, Object body, int expectedStatus)
            throws Exception {
        if (s != null) {
            req.header("Authorization", "Bearer " + s.token());
        }
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body));
        }
        MvcResult r = mvc.perform(req).andReturn();
        int status = r.getResponse().getStatus();
        String content = r.getResponse().getContentAsString();
        if (status != expectedStatus) {
            throw new AssertionError("Expected HTTP " + expectedStatus + " but got " + status + ": " + content);
        }
        return content.isBlank() ? json.nullNode() : json.readTree(content);
    }

    protected JsonNode getJson(String url, Session s, int expectedStatus) throws Exception {
        return call(get(url), s, null, expectedStatus);
    }

    protected JsonNode postJson(String url, Session s, Object body, int expectedStatus) throws Exception {
        return call(post(url), s, body, expectedStatus);
    }

    protected String claimsUrl(Session s) {
        return "/api/v1/companies/" + s.companyId() + "/claims";
    }

    protected record Session(String token, String companyId, String membershipId, String email) {
    }
}
