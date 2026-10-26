package com.hisabloop.contact;

import java.time.Duration;
import java.time.Instant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hisabloop.common.error.ApiException;
import com.hisabloop.config.AppProperties;
import com.hisabloop.security.RateLimiter;

/** Public "contact us / book a demo" form. Requests are stored; the response only confirms storage. */
@RestController
public class ContactController {

    private final ContactRequestRepository repository;
    private final RateLimiter rateLimiter;
    private final AppProperties properties;

    public ContactController(ContactRequestRepository repository, RateLimiter rateLimiter, AppProperties properties) {
        this.repository = repository;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
    }

    public record ContactBody(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 190) String email,
            @Size(max = 160) String companyName,
            @Pattern(regexp = "^$|^[+0-9 ()-]{7,20}$", message = "Enter a valid phone number") String phone,
            @Size(max = 20) String teamSize,
            @NotBlank @Pattern(regexp = "DEMO|SALES|SUPPORT|PARTNERSHIP|OTHER") String topic,
            @NotBlank @Size(min = 10, max = 2000) String message,
            /** Honeypot field: real users never fill it. */
            @Size(max = 0, message = "Invalid submission") String website) {
    }

    public record ContactResponse(String id, Instant receivedAt) {
    }

    @PostMapping("/api/v1/public/contact")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ContactResponse submit(@Valid @RequestBody ContactBody body, HttpServletRequest request) {
        int max = Math.max(1, properties.contact().maxRequestsPerHour());
        if (!rateLimiter.tryAcquire("contact:" + request.getRemoteAddr(), max, Duration.ofHours(1))) {
            throw ApiException.tooManyRequests("Too many requests from your network. Please try again later.");
        }
        ContactRequest r = new ContactRequest();
        r.setFullName(body.fullName().trim());
        r.setEmail(body.email().trim().toLowerCase());
        r.setCompanyName(body.companyName());
        r.setPhone(body.phone() == null || body.phone().isBlank() ? null : body.phone().trim());
        r.setTeamSize(body.teamSize());
        r.setTopic(body.topic());
        r.setMessage(body.message().trim());
        repository.save(r);
        return new ContactResponse(r.getId(), r.getCreatedAt());
    }
}
