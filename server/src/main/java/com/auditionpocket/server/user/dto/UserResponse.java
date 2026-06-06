package com.auditionpocket.server.user.dto;

import com.auditionpocket.server.user.User;

import java.time.Instant;

public record UserResponse(
        String id,
        String email,
        String name,
        String statusCode,
        String accountType,
        String role,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLoginAt,
        Instant deletedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getStatusCode(),
                user.getAccountType(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLoginAt(),
                user.getDeletedAt()
        );
    }
}