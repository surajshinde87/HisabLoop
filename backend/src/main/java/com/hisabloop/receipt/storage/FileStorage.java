package com.hisabloop.receipt.storage;

/**
 * Private binary storage for receipts. Keys are opaque and never served directly; files are only
 * returned through authorised API endpoints. Swap {@link LocalFileStorage} for an object-storage
 * implementation (S3, GCS, Azure Blob) without touching callers.
 */
public interface FileStorage {

    /** Stores the bytes and returns the storage key. */
    String store(String companyId, byte[] content, String extension);

    byte[] load(String key);

    boolean exists(String key);

    /** Writes bytes at a known key (used by the development seed). */
    void storeAt(String key, byte[] content);
}
