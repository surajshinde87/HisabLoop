package com.hisabloop.receipt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class ReceiptFileChecksTest {

    @Test
    void detectsTypeFromMagicBytesNotFromName() {
        assertEquals("image/png", ReceiptService.detectType(new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A}));
        assertEquals("image/jpeg", ReceiptService.detectType(new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00}));
        assertEquals("application/pdf", ReceiptService.detectType("%PDF-1.7".getBytes()));
        assertNull(ReceiptService.detectType("<html><script>".getBytes()));
        assertNull(ReceiptService.detectType(new byte[0]));
    }

    @Test
    void sanitisesFilenames() {
        assertEquals("passwd", ReceiptService.safeFilename("../../etc/passwd"));
        assertEquals("bill_1_.png", ReceiptService.safeFilename("C:\\Users\\x\\bill<1>.png"));
        assertEquals("receipt", ReceiptService.safeFilename(null));
    }
}
