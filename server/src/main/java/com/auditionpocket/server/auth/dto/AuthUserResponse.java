package com.auditionpocket.server.auth.dto;

import com.auditionpocket.server.user.User;

public record AuthUserResponse(
        String id,
        String email,
        String name,
        String statusCode,
        String role
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getStatusCode(),
                user.getRole()
        );
    }
}