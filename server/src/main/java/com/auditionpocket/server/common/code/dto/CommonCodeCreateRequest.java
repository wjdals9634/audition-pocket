package com.auditionpocket.server.common.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommonCodeCreateRequest(
        @NotBlank String groupCode,
        @NotBlank String code,
        @NotBlank String label,
        String description,
        @NotNull Integer displayOrder,
        @NotNull Boolean active
) {
}