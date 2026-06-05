package com.auditionpocket.server.clip.dto;

public record ClipSearchCondition(
        String keyword,
        String statusCode,
        String sourceCode,
        ClipSortType sort
) {
    public ClipSortType resolvedSort() {
        if (sort == null) {
            return ClipSortType.RECENT;
        }

        return sort;
    }
}