package com.hisabloop.reimbursement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.hisabloop.audit.AuditService;
import com.hisabloop.claim.ClaimRepository;
import com.hisabloop.claim.ClaimStatus;
import com.hisabloop.claim.ExpenseClaim;
import com.hisabloop.common.error.ApiException;
import com.hisabloop.company.Company;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.company.CompanyRepository;
import com.hisabloop.company.Membership;
import com.hisabloop.company.Permission;
import com.hisabloop.company.Role;
import com.hisabloop.integration.ClaimMessenger;
import com.hisabloop.support.Fixtures;
import com.hisabloop.user.UserRepository;

class ReimbursementServiceTest {

    private CompanyAccessService access;
    private ClaimRepository claims;
    private ReimbursementBatchRepository batches;
    private ReimbursementBatchItemRepository items;
    private PaymentRecordRepository payments;
    private AuditService audit;
    private ReimbursementService service;
    private Company company;
    private Membership anita;
    private Membership ravi;
    private Membership sneha;
    private final List<ReimbursementBatchItem> savedItems = new ArrayList<>();

    @BeforeEach
    void setUp() {
        access = mock(CompanyAccessService.class);
        CompanyRepository companies = mock(CompanyRepository.class);
        claims = mock(ClaimRepository.class);
        batches = mock(ReimbursementBatchRepository.class);
        items = mock(ReimbursementBatchItemRepository.class);
        payments = mock(PaymentRecordRepository.class);
        audit = mock(AuditService.class);
        service = new ReimbursementService(access, companies, claims, batches, items, payments,
                mock(UserRepository.class), audit, mock(ClaimMessenger.class),
                Clock.fixed(Instant.parse("2026-10-25T06:00:00Z"), ZoneOffset.UTC));

        company = new Company();
        company.setId(Fixtures.COMPANY);
        company.setName("Shinde Agro Traders");
        company.setNextBatchNumber(104);
        when(companies.findByIdForUpdate(Fixtures.COMPANY)).thenReturn(Optional.of(company));

        anita = Fixtures.member("Anita", Role.FINANCE, null);
        ravi = Fixtures.member("Ravi", Role.EMPLOYEE, null);
        sneha = Fixtures.member("Sneha", Role.EMPLOYEE, null);
        when(access.require(eq(Fixtures.COMPANY), any(Permission.class))).thenReturn(Fixtures.access(anita));
        when(batches.saveAndFlush(any())).thenAnswer(inv -> {
            ReimbursementBatch b = inv.getArgument(0);
            b.setId(UUID.randomUUID().toString());
            return b;
        });
        when(items.saveAll(any())).thenAnswer(inv -> {
            Iterable<ReimbursementBatchItem> it = inv.getArgument(0);
            it.forEach(savedItems::add);
            return inv.getArgument(0);
        });
        when(items.findByBatchId(anyString())).thenAnswer(inv -> savedItems);
    }

    @Test
    void createsBatchWithCorrectTotalsAndMovesClaimsToInBatch() {
        ExpenseClaim a = Fixtures.claim(ravi, "1240.00", ClaimStatus.APPROVED);
        ExpenseClaim b = Fixtures.claim(ravi, "680.50", ClaimStatus.APPROVED);
        ExpenseClaim c = Fixtures.claim(sneha, "3500.00", ClaimStatus.APPROVED);
        when(claims.findAllForUpdate(eq(Fixtures.COMPANY), anyCollection())).thenReturn(List.of(a, b, c));
        when(claims.findByBatchIdOrderByClaimNumber(anyString())).thenReturn(List.of(a, b, c));

        ReimbursementDtos.BatchDetail detail = service.create(Fixtures.COMPANY,
                new ReimbursementDtos.CreateBatchRequest(List.of(a.getId(), b.getId(), c.getId()), null));

        assertEquals(new BigDecimal("5420.50"), detail.batch().totalAmount());
        assertEquals(3, detail.batch().claimCount());
        assertEquals("B-104", detail.batch().reference());
        assertEquals(105, company.getNextBatchNumber());
        assertEquals(2, detail.employees().size());
        BigDecimal raviTotal = detail.employees().stream().filter(e -> e.name().equals("Ravi")).findFirst()
                .orElseThrow().amount();
        assertEquals(new BigDecimal("1920.50"), raviTotal);
        for (ExpenseClaim x : List.of(a, b, c)) {
            assertEquals(ClaimStatus.IN_BATCH, x.getStatus());
        }
        assertEquals(3, savedItems.size());
    }

    @Test
    void rejectsClaimsThatAreNotApprovedOrAlreadyBatched() {
        ExpenseClaim rejected = Fixtures.claim(ravi, "100.00", ClaimStatus.REJECTED);
        ExpenseClaim batched = Fixtures.claim(ravi, "100.00", ClaimStatus.IN_BATCH);
        batched.setBatchId("other");
        when(claims.findAllForUpdate(eq(Fixtures.COMPANY), anyCollection())).thenReturn(List.of(rejected, batched));

        ApiException e = assertThrows(ApiException.class, () -> service.create(Fixtures.COMPANY,
                new ReimbursementDtos.CreateBatchRequest(List.of(rejected.getId(), batched.getId()), null)));
        assertEquals("ineligible_claims", e.getCode());
        assertEquals(ClaimStatus.REJECTED, rejected.getStatus());
        verify(batches, never()).saveAndFlush(any());
    }

    @Test
    void unknownClaimIdsAreRejected() {
        when(claims.findAllForUpdate(eq(Fixtures.COMPANY), anyCollection())).thenReturn(List.of());
        assertThrows(ApiException.class, () -> service.create(Fixtures.COMPANY,
                new ReimbursementDtos.CreateBatchRequest(List.of("missing"), null)));
    }

    @Test
    void markPaidUpdatesClaimsOnceAndRefusesSecondPayment() {
        ReimbursementBatch batch = new ReimbursementBatch();
        batch.setId("batch-1");
        batch.setCompanyId(Fixtures.COMPANY);
        batch.setBatchNumber(104);
        batch.setTotalAmount(new BigDecimal("1920.50"));
        batch.setCreatedByUserId(anita.getUser().getId());
        ExpenseClaim a = Fixtures.claim(ravi, "1240.00", ClaimStatus.IN_BATCH);
        ExpenseClaim b = Fixtures.claim(ravi, "680.50", ClaimStatus.IN_BATCH);
        a.setBatchId("batch-1");
        b.setBatchId("batch-1");
        ReimbursementBatchItem i1 = new ReimbursementBatchItem();
        i1.setClaimId(a.getId());
        ReimbursementBatchItem i2 = new ReimbursementBatchItem();
        i2.setClaimId(b.getId());
        savedItems.addAll(List.of(i1, i2));
        when(batches.findForUpdate("batch-1", Fixtures.COMPANY)).thenReturn(Optional.of(batch));
        when(payments.findByBatchId("batch-1")).thenReturn(Optional.empty());
        when(claims.findAllForUpdate(eq(Fixtures.COMPANY), anyCollection())).thenReturn(List.of(a, b));
        when(claims.findByBatchIdOrderByClaimNumber("batch-1")).thenReturn(List.of(a, b));

        ReimbursementDtos.MarkPaidRequest req = new ReimbursementDtos.MarkPaidRequest("NEFT", "HDFC-123",
                LocalDate.of(2026, 10, 25));
        service.markPaid(Fixtures.COMPANY, "batch-1", req);

        assertEquals(ReimbursementBatch.PAID, batch.getStatus());
        assertEquals(ClaimStatus.PAID, a.getStatus());
        assertEquals(ClaimStatus.PAID, b.getStatus());
        verify(payments).save(any(PaymentRecord.class));

        ApiException again = assertThrows(ApiException.class, () -> service.markPaid(Fixtures.COMPANY, "batch-1", req));
        assertEquals("already_paid", again.getCode());
    }

    @Test
    void bankFileHasDocumentedHeaderAndOneRowPerEmployee() {
        ReimbursementBatch batch = new ReimbursementBatch();
        batch.setId("batch-1");
        batch.setBatchNumber(104);
        batch.setCompanyId(Fixtures.COMPANY);
        when(batches.findByIdAndCompanyId("batch-1", Fixtures.COMPANY)).thenReturn(Optional.of(batch));
        ExpenseClaim a = Fixtures.claim(ravi, "1240.00", ClaimStatus.IN_BATCH);
        ExpenseClaim b = Fixtures.claim(ravi, "680.50", ClaimStatus.IN_BATCH);
        ExpenseClaim c = Fixtures.claim(sneha, "350.00", ClaimStatus.IN_BATCH);
        when(claims.findByBatchIdOrderByClaimNumber("batch-1")).thenReturn(List.of(a, b, c));

        String csv = new String(service.bankFile(Fixtures.COMPANY, "batch-1").content(), StandardCharsets.UTF_8);
        String[] lines = csv.replace("﻿", "").split("\r\n");
        assertEquals(String.join(",", ReimbursementService.BANK_FILE_COLUMNS), lines[0]);
        assertEquals(3, lines.length);
        assertTrue(lines[1].startsWith("B-104,Ravi,"));
        assertTrue(lines[1].contains(",2,1920.50,"));
        assertTrue(lines[2].contains(",1,350.00,"));
    }
}
