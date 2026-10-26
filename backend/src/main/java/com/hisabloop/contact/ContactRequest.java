package com.hisabloop.contact;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "contact_requests")
public class ContactRequest {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 190)
    private String email;

    @Column(name = "company_name", length = 160)
    private String companyName;

    @Column(length = 20)
    private String phone;

    @Column(name = "team_size", length = 20)
    private String teamSize;

    @Column(nullable = false, length = 40)
    private String topic;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false, length = 20)
    private String status = "NEW";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
