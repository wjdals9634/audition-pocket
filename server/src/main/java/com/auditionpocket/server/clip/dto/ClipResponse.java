package com.auditionpocket.server.clip.dto;

import com.auditionpocket.server.clip.Clip;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

public record ClipResponse(
        String id,
        String userId,
        String title,
        String sourceCode,
        String sourceUrl,
        LocalDate deadlineDate,
        Long daysLeft,
        String statusCode,
        List<String> tagIds,
        String memo,
        Boolean hidden,
        Instant createdAt,
        Instant updatedAt
) {
    public static ClipResponse from(Clip clip) {
        return new ClipResponse(
                clip.getId(),
                clip.getUserId(),
                clip.getTitle(),
                clip.getSourceCode(),
                clip.getSourceUrl(),
                clip.getDeadlineDate(),
                calculateDaysLeft(clip.getDeadlineDate()),
                clip.getStatusCode(),
                clip.getTagIds(),
                clip.getMemo(),
                clip.getHidden(),
                clip.getCreatedAt(),
                clip.getUpdatedAt()
        );
    }

    private static Long calculateDaysLeft(LocalDate deadlineDate) {
        if (deadlineDate == null) {
            return null;
        }

        return ChronoUnit.DAYS.between(LocalDate.now(), deadlineDate);
    }
}