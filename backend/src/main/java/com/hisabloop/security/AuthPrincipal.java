package com.hisabloop.security;

/** Authenticated caller as established from a verified access token. */
public record AuthPrincipal(String userId, String email) {
}
