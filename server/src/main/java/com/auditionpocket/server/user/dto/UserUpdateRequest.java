package com.auditionpocket.server.user.dto;

public record UserUpdateRequest(
        String name,
        String statusCode
) {
}