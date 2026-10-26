package com.hisabloop.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClockConfig {

    /** All persisted event times are UTC. Injecting a Clock keeps services testable. */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
