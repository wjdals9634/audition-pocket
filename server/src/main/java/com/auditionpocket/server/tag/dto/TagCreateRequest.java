package com.auditionpocket.server.tag.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TagCreateRequest(
        @NotBlank String name,
        @NotNull Integer displayOrder,
        @NotNull Boolean active
) {
}