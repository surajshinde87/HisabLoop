package com.hisabloop.notification;

/** Outbound email. Replace {@link LoggingEmailSender} with an SMTP/provider implementation in production. */
public interface EmailSender {

    /** @return true if the message was handed to a real delivery provider */
    boolean send(String to, String subject, String body);
}
