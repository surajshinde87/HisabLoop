package com.hisabloop.common.web;

import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.hisabloop.common.error.ApiException;

/** Builds safe Pageables: bounded page size and a whitelist of sortable properties. */
public final class Pagination {

    public static final int MAX_SIZE = 100;

    private Pagination() {
    }

    /**
     * @param sort         e.g. "receiptDate,desc"; may be null
     * @param allowedSorts API field name to entity property
     */
    public static Pageable of(int page, int size, String sort, Map<String, String> allowedSorts, Sort defaultSort) {
        if (page < 0) {
            throw ApiException.badRequest("invalid_page", "page must be >= 0");
        }
        int boundedSize = Math.min(Math.max(size, 1), MAX_SIZE);
        Sort s = defaultSort;
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String property = allowedSorts.get(parts[0].trim());
            if (property == null) {
                throw ApiException.badRequest("invalid_sort", "Unsupported sort field: " + parts[0].trim());
            }
            Sort.Direction dir = parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc")
                    ? Sort.Direction.ASC : Sort.Direction.DESC;
            s = Sort.by(dir, property).and(defaultSort);
        }
        return PageRequest.of(page, boundedSize, s);
    }
}
