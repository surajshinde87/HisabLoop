package com.hisabloop.notification;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final EmailSender emailSender;
    private final NotificationRecordRepository records;

    public NotificationService(EmailSender emailSender, NotificationRecordRepository records) {
        this.emailSender = emailSender;
        this.records = records;
    }

    @Transactional
    public NotificationRecord email(String companyId, String userId, String to, String template, String subject,
            String body) {
        boolean delivered;
        String status;
        try {
            delivered = emailSender.send(to, subject, body);
            status = delivered ? "SENT" : "LOGGED";
        } catch (RuntimeException e) {
            status = "FAILED";
        }
        return save(companyId, userId, "EMAIL", to, template, subject, body, status);
    }

    @Transactional
    public NotificationRecord save(String companyId, String userId, String channel, String recipient, String template,
            String subject, String body, String status) {
        NotificationRecord r = new NotificationRecord();
        r.setCompanyId(companyId);
        r.setUserId(userId);
        r.setChannel(channel);
        r.setRecipient(recipient);
        r.setTemplate(template);
        r.setSubject(subject);
        r.setBody(body);
        r.setStatus(status);
        return records.save(r);
    }
}
