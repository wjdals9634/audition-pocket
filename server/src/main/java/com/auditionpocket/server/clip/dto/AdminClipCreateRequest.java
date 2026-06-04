package com.auditionpocket.server.clip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record AdminClipCreateRequest(
        @NotBlank String userId,
        @NotBlank String title,
        @NotBlank String sourceCode,
        @NotBlank String sourceUrl,
        @NotNull LocalDate deadlineDate,
        @NotBlank String statusCode,
        List<String> tagIds,
        String memo
) {
}