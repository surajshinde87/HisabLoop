package com.hisabloop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class HisabLoopApplication {

    public static void main(String[] args) {
        SpringApplication.run(HisabLoopApplication.class, args);
        System.out.println("Application is started");
    }
}
