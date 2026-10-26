package com.hisabloop.notification;

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
@Table(name = "notification_records")
public class NotificationRecord {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "company_id", length = 36)
    private String companyId;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(nullable = false, length = 20)
    private String channel;

    @Column(nullable = false, length = 190)
    private String recipient;

    @Column(nullable = false, length = 60)
    private String template;

    @Column(length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false, length = 20)
    private String status;

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
