package com.auditionpocket.server.auth.dto;

import com.auditionpocket.server.user.User;

import java.time.Instant;

public record AuthUserResponse(
        String id,
        String email,
        String name,
        String statusCode,
        String accountType,
        String role,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLoginAt
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getStatusCode(),
                user.getAccountType(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLoginAt()
        );
    }
}