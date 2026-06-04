package com.auditionpocket.server.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserCreateRequest(
        @NotBlank
        @Email
        String email,

        @NotBlank
        String name,

        @NotBlank
        String password
) {
}