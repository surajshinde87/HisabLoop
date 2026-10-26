package com.hisabloop.claim;

import java.time.LocalDate;
import java.util.List;

/** Server-side claim list filters (all optional). */
public record ClaimFilter(
        String q,
        List<ClaimStatus> statuses,
        String categoryCode,
        String employeeMembershipId,
        String teamId,
        LocalDate from,
        LocalDate to,
        boolean flaggedOnly,
        List<ClaimSource> sources) {
}
