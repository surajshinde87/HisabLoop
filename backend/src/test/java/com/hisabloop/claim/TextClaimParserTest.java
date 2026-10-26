package com.hisabloop.claim;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class TextClaimParserTest {

    @Test
    void parsesAutoFareCash() {
        TextClaimParser.Parsed p = TextClaimParser.parse("Auto fare 180 cash");
        assertEquals(new BigDecimal("180.00"), p.amount());
        assertEquals("TRAVEL", p.categoryCode());
        assertEquals("CASH", p.paymentMode());
        assertEquals("Auto fare 180 cash", p.description());
    }

    @Test
    void prefersCurrencyMarkedAmount() {
        TextClaimParser.Parsed p = TextClaimParser.parse("Metro rail ticket ₹45 to Dadar office, 2 people");
        assertEquals(new BigDecimal("45.00"), p.amount());
        assertEquals("TRAVEL", p.categoryCode());
    }

    @Test
    void skipsDatesByTakingLargestNumber() {
        assertEquals(new BigDecimal("450.00"), TextClaimParser.parse("Taxi on 8 Oct 450 upi").amount());
    }

    @Test
    void understandsIndianDigitGrouping() {
        assertEquals(new BigDecimal("124000.00"), TextClaimParser.parse("Laptop repair Rs 1,24,000").amount());
        assertEquals(new BigDecimal("1240.00"), TextClaimParser.parse("Uber 1,240").amount());
    }

    @Test
    void clientDinnerIsEntertainmentNotFood() {
        assertEquals("CLIENT_ENTERTAINMENT", TextClaimParser.parse("Client dinner 5400 card").categoryCode());
        assertEquals("CARD", TextClaimParser.parse("Client dinner 5400 card").paymentMode());
    }

    @Test
    void unknownTextFallsBackToOther() {
        TextClaimParser.Parsed p = TextClaimParser.parse("misc");
        assertNull(p.amount());
        assertEquals("OTHER", p.categoryCode());
    }
}
