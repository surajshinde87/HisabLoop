package com.hisabloop.receipt.storage;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.hisabloop.common.error.ApiException;
import com.hisabloop.config.AppProperties;

/** Stores files under hisabloop.storage.directory (outside any web root). */
@Component
public class LocalFileStorage implements FileStorage {

    private final Path root;

    public LocalFileStorage(AppProperties properties) {
        this.root = Paths.get(properties.storage().directory()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot create storage directory " + root, e);
        }
    }

    @Override
    public String store(String companyId, byte[] content, String extension) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String key = "%s/%d/%02d/%s.%s".formatted(companyId, today.getYear(), today.getMonthValue(),
                UUID.randomUUID(), extension);
        storeAt(key, content);
        return key;
    }

    @Override
    public void storeAt(String key, byte[] content) {
        Path target = resolve(key);
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING,
                    StandardOpenOption.WRITE);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store file", e);
        }
    }

    @Override
    public byte[] load(String key) {
        Path path = resolve(key);
        if (!Files.isRegularFile(path)) {
            throw ApiException.notFound("Receipt file");
        }
        try {
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read file", e);
        }
    }

    @Override
    public boolean exists(String key) {
        return Files.isRegularFile(resolve(key));
    }

    private Path resolve(String key) {
        Path p = root.resolve(key).normalize();
        if (!p.startsWith(root)) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        return p;
    }
}
