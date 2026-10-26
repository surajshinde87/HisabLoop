package com.hisabloop.integration;

import org.springframework.stereotype.Component;

/** Development gateway: messages are only stored (status LOGGED) and shown in the simulator. */
@Component
public class SimulatedMessagingGateway implements MessagingGateway {

    @Override
    public String mode() {
        return "SIMULATED";
    }

    @Override
    public boolean send(String toPhone, String text) {
        return false;
    }
}
