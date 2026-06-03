package com.auditionpocket.server.tag.dto;

import com.auditionpocket.server.tag.Tag;

import java.time.Instant;

public record TagResponse(
        String id,
        String name,
        Integer displayOrder,
        Boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static TagResponse from(Tag tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getDisplayOrder(),
                tag.getActive(),
                tag.getCreatedAt(),
                tag.getUpdatedAt()
        );
    }
}