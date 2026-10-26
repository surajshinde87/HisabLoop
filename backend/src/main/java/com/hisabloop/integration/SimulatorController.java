package com.hisabloop.integration;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hisabloop.company.CompanyAccess;
import com.hisabloop.company.CompanyAccessService;
import com.hisabloop.notification.NotificationRecord;
import com.hisabloop.notification.NotificationRecordRepository;

/** Messages produced by the simulated WhatsApp gateway for the signed-in user. */
@RestController
@RequestMapping("/api/v1/companies/{companyId}/whatsapp")
public class SimulatorController {

    private final CompanyAccessService accessService;
    private final NotificationRecordRepository records;
    private final MessagingGateway gateway;

    public SimulatorController(CompanyAccessService accessService, NotificationRecordRepository records,
            MessagingGateway gateway) {
        this.accessService = accessService;
        this.records = records;
        this.gateway = gateway;
    }

    public record MessageDto(String id, String template, String body, String status, Instant createdAt) {
    }

    public record StatusDto(String mode, boolean businessApiConfigured, String message) {
    }

    @GetMapping("/status")
    public StatusDto status(@PathVariable String companyId) {
        accessService.require(companyId);
        boolean real = !"SIMULATED".equals(gateway.mode());
        return new StatusDto(gateway.mode(), real, real ? "WhatsApp Business API connected"
                : "Simulated: messages are stored and shown here; nothing is sent to WhatsApp.");
    }

    @GetMapping("/messages")
    @Transactional(readOnly = true)
    public List<MessageDto> messages(@PathVariable String companyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant since) {
        CompanyAccess access = accessService.require(companyId);
        return records.findTop50ByCompanyIdAndUserIdAndChannelOrderByCreatedAtDesc(companyId, access.userId(),
                        "WHATSAPP").stream()
                .filter(r -> since == null || !r.getCreatedAt().isBefore(since))
                .sorted(Comparator.comparing(NotificationRecord::getCreatedAt))
                .map(r -> new MessageDto(r.getId(), r.getTemplate(), r.getBody(), r.getStatus(), r.getCreatedAt()))
                .toList();
    }
}
