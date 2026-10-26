package com.hisabloop.claim;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class GstinValidatorTest {

    @Test
    void acceptsWellFormedGstins() {
        assertTrue(GstinValidator.isValidFormat("27AABCS1429B1Z5"));
        assertTrue(GstinValidator.isValidFormat("29AADCB2230M1ZP"));
        assertTrue(GstinValidator.isValidFormat("07AAFCZ1243K1ZN"));
    }

    @Test
    void rejectsMalformedGstins() {
        assertFalse(GstinValidator.isValidFormat("27AAAAA0000A1A"));      // too short
        assertFalse(GstinValidator.isValidFormat("27AABCS1429B0Z5"));     // entity code 0 not allowed
        assertFalse(GstinValidator.isValidFormat("27AABCS1429B1X5"));     // 14th char must be Z
        assertFalse(GstinValidator.isValidFormat("2AABCS1429B1Z5X"));     // state code not numeric
        assertFalse(GstinValidator.isValidFormat("27aabcs1429b1z5"));     // lower case
        assertFalse(GstinValidator.isValidFormat(null));
    }

    @Test
    void normalisesWhitespaceAndCase() {
        assertEquals("27AABCS1429B1Z5", GstinValidator.normalise(" 27aabcs 1429b1z5 "));
        assertNull(GstinValidator.normalise("   "));
        assertNull(GstinValidator.normalise(null));
    }
}
