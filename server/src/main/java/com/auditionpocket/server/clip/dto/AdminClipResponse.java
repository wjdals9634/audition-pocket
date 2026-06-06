package com.auditionpocket.server.clip.dto;

import com.auditionpocket.server.clip.Clip;
import com.auditionpocket.server.user.User;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

public record AdminClipResponse(
        String id,
        String userId,
        String userEmail,
        String userName,
        String userStatusCode,
        String userAccountType,
        String userRole,
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
    public static AdminClipResponse from(
            Clip clip,
            User user
    ) {
        return new AdminClipResponse(
                clip.getId(),
                clip.getUserId(),
                user == null ? null : user.getEmail(),
                user == null ? null : user.getName(),
                user == null ? null : user.getStatusCode(),
                resolveAccountType(clip, user),
                user == null ? null : user.getRole(),
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

    private static String resolveAccountType(
            Clip clip,
            User user
    ) {
        if (user != null && user.getAccountType() != null) {
            return user.getAccountType();
        }

        if (user != null && user.getEmail() == null) {
            return "GUEST";
        }

        if (clip.getUserId() != null && user == null) {
            return "UNKNOWN";
        }

        return null;
    }

    private static Long calculateDaysLeft(LocalDate deadlineDate) {
        if (deadlineDate == null) {
            return null;
        }

        return ChronoUnit.DAYS.between(LocalDate.now(), deadlineDate);
    }
}