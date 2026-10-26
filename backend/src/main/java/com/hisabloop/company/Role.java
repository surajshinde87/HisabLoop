package com.hisabloop.company;

/**
 * Company membership roles. CA partners are not company members: they reach client companies
 * through {@code ca_client_relationships} and are represented by {@link #CA_PARTNER} only in the
 * resolved access context.
 */
public enum Role {
    ADMIN,
    FINANCE,
    MANAGER,
    EMPLOYEE,
    CA_PARTNER;

    public boolean isMembershipRole() {
        return this != CA_PARTNER;
    }
}
