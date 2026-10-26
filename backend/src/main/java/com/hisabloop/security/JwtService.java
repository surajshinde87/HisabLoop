package com.hisabloop.security;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import com.hisabloop.config.AppProperties;

/** Issues and verifies short-lived HS256 access tokens. */
@Service
public class JwtService {

    private final SecretKey key;
    private final AppProperties.Jwt config;
    private final Clock clock;

    public JwtService(AppProperties properties, Clock clock) {
        this.config = properties.jwt();
        this.clock = clock;
        this.key = Keys.hmacShaKeyFor(secretBytes(config.secret()));
    }

    static byte[] secretBytes(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET is not set. Provide a random secret of at least 32 bytes (see backend/.env).");
        }
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException notBase64) {
            bytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes (256 bits)");
        }
        return bytes;
    }

    public String issueAccessToken(String userId, String email) {
        Instant now = clock.instant();
        return Jwts.builder()
                .issuer(config.issuer())
                .subject(userId)
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(config.accessTokenTtl())))
                .signWith(key)
                .compact();
    }

    public long accessTokenTtlSeconds() {
        return config.accessTokenTtl().toSeconds();
    }

    public Optional<AuthPrincipal> verify(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(config.issuer())
                    .clock(() -> Date.from(clock.instant()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(new AuthPrincipal(claims.getSubject(), claims.get("email", String.class)));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
