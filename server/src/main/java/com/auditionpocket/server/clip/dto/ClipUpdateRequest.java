package com.auditionpocket.server.clip.dto;

import java.time.LocalDate;
import java.util.List;

public record ClipUpdateRequest(
        String title,
        String sourceCode,
        String sourceUrl,
        LocalDate deadlineDate,
        String statusCode,
        List<String> tagIds,
        String memo,
        Boolean hidden
) {
}