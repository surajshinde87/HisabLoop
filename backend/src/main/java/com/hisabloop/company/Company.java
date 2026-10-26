package com.hisabloop.company;

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
@Table(name = "companies")
public class Company extends BaseEntity {

    @Column(nullable = false, length = 160)
    private String name;

    @Column(name = "legal_name", length = 200)
    private String legalName;

    @Column(length = 15)
    private String gstin;

    @Column(length = 190)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 80)
    private String city;

    @Column(length = 80)
    private String state;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private Plan plan = Plan.STARTER;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "next_claim_number", nullable = false)
    private int nextClaimNumber = 1001;

    @Column(name = "next_batch_number", nullable = false)
    private int nextBatchNumber = 101;

    public int takeNextClaimNumber() {
        return nextClaimNumber++;
    }

    public int takeNextBatchNumber() {
        return nextBatchNumber++;
    }
}
