package com.auditionpocket.server.tag.dto;

public record TagUpdateRequest(
        String name,
        Integer displayOrder,
        Boolean active
) {
}