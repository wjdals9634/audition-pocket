package com.auditionpocket.server.common.code.dto;

import com.auditionpocket.server.common.code.CommonCode;

import java.time.Instant;

public record CommonCodeResponse(
        String id,
        String groupCode,
        String code,
        String label,
        String description,
        Integer displayOrder,
        Boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static CommonCodeResponse from(CommonCode commonCode) {
        return new CommonCodeResponse(
                commonCode.getId(),
                commonCode.getGroupCode(),
                commonCode.getCode(),
                commonCode.getLabel(),
                commonCode.getDescription(),
                commonCode.getDisplayOrder(),
                commonCode.getActive(),
                commonCode.getCreatedAt(),
                commonCode.getUpdatedAt()
        );
    }
}