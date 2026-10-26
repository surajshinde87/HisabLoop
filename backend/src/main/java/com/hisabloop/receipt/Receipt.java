package com.hisabloop.receipt;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.hisabloop.common.persistence.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "receipts")
public class Receipt extends BaseEntity {

    @Column(name = "company_id", nullable = false, length = 36)
    private String companyId;

    @Column(name = "claim_id", nullable = false, length = 36)
    private String claimId;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    /** Opaque key inside the private storage area; never a public URL. */
    @Column(name = "storage_key", nullable = false, length = 255)
    private String storageKey;

    @Column(nullable = false, length = 64)
    private String sha256;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false, length = 20, columnDefinition = "varchar(20)")
    private ProcessingStatus processingStatus = ProcessingStatus.UPLOADED;

    @Column(length = 40)
    private String provider;

    @Column(precision = 5, scale = 2)
    private BigDecimal confidence;

    @Column(name = "extracted_json", columnDefinition = "TEXT")
    private String extractedJson;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "uploaded_by_user_id", nullable = false, length = 36)
    private String uploadedByUserId;

    @Column(name = "processed_at")
    private Instant processedAt;
}
