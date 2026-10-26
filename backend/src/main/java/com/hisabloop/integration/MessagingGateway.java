package com.hisabloop.integration;

/**
 * Outbound chat messaging (WhatsApp). The default implementation is {@link SimulatedMessagingGateway},
 * which does not contact WhatsApp. A WhatsApp Business (Cloud API) adapter implements this
 * interface and reads its access token and phone-number id from environment variables.
 */
public interface MessagingGateway {

    /** e.g. "SIMULATED" or "WHATSAPP_CLOUD_API". */
    String mode();

    /** @return true only if a real provider accepted the message */
    boolean send(String toPhone, String text);
}
