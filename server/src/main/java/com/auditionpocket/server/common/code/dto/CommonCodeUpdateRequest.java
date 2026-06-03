package com.auditionpocket.server.common.code.dto;

public record CommonCodeUpdateRequest(
        String label,
        String description,
        Integer displayOrder,
        Boolean active
) {
}