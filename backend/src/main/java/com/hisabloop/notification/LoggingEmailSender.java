package com.hisabloop.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Development email sender: writes the message to the application log instead of delivering it.
 * Notification records created through it are stored with status LOGGED, never SENT.
 * Message bodies (which can contain one-time links) are only logged when
 * {@code hisabloop.mail.log-bodies=true}, which is set in the dev profile only.
 * To deliver real email, replace this bean with an SMTP/provider-backed EmailSender.
 */
@Component
public class LoggingEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailSender.class);

    private final boolean logBodies;

    public LoggingEmailSender(@Value("${hisabloop.mail.log-bodies:false}") boolean logBodies) {
        this.logBodies = logBodies;
    }

    @Override
    public boolean send(String to, String subject, String body) {
        if (logBodies) {
            log.info("[email not delivered - no provider configured] to={} subject=\"{}\"\n{}", to, subject, body);
        } else {
            log.info("[email not delivered - no provider configured] subject=\"{}\" (body suppressed)", subject);
        }
        return false;
    }
}
