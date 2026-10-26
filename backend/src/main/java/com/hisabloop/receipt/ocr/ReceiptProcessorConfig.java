package com.hisabloop.receipt.ocr;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.hisabloop.config.AppProperties;

@Configuration
public class ReceiptProcessorConfig {

    private static final Logger log = LoggerFactory.getLogger(ReceiptProcessorConfig.class);

    /**
     * hisabloop.ocr.provider: "mock" (development) or "none". A real provider (e.g. a cloud OCR
     * API) is added as another ReceiptProcessor implementation and selected here, with its API key
     * read from the environment.
     */
    @Bean
    public ReceiptProcessor receiptProcessor(AppProperties properties) {
        String provider = properties.ocr() == null ? "none" : properties.ocr().provider();
        if ("mock".equalsIgnoreCase(provider)) {
            log.warn("Using the MOCK receipt processor. It only recognises bundled sample receipts. Do not use in production.");
            return new MockReceiptProcessor();
        }
        if (provider != null && !provider.isBlank() && !"none".equalsIgnoreCase(provider)) {
            throw new IllegalStateException("Unknown OCR provider '" + provider + "'. Supported: mock, none");
        }
        log.info("No OCR provider configured; receipts will require manual entry.");
        return new NoOcrReceiptProcessor();
    }
}
