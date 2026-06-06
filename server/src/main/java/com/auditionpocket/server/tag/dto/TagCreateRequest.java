package com.auditionpocket.server.tag.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record TagCreateRequest(

        @NotBlank
        String name,

        @Min(1)
        Integer displayOrder,

        Boolean active
) {
}