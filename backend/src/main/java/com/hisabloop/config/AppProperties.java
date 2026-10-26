package com.hisabloop.config;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application settings bound from the {@code hisabloop.*} namespace. Secrets are only ever
 * supplied through environment variables (see backend/.env).
 */
@ConfigurationProperties(prefix = "hisabloop")
public record AppProperties(
        Jwt jwt,
        Cookie cookie,
        Cors cors,
        String frontendBaseUrl,
        Storage storage,
        Ocr ocr,
        Auth auth,
        Contact contact,
        Map<String, BigDecimal> plans,
        Demo demo) {

    public record Jwt(String secret, String issuer, Duration accessTokenTtl, Duration refreshTokenTtl) {
    }

    public record Cookie(boolean secure, String sameSite) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    public record Storage(String directory, long maxFileBytes) {
    }

    public record Ocr(String provider) {
    }

    public record Auth(boolean selfRegistrationEnabled) {
    }

    public record Contact(int maxRequestsPerHour) {
    }

    public record Demo(boolean seed) {
    }
}
