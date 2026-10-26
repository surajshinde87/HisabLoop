package com.hisabloop.reporting;

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
@Table(name = "export_jobs")
public class ExportJob {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "requested_by_user_id", nullable = false, length = 36)
    private String requestedByUserId;

    @Column(name = "report_type", nullable = false, length = 30)
    private String reportType;

    @Column(nullable = false, length = 10)
    private String format;

    @Column(name = "row_count", nullable = false)
    private int rowCount;

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
