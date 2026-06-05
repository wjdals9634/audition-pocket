package com.auditionpocket.server.user;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String email;
    private String passwordHash;
    private String name;

    private String statusCode;
    private String accountType;
    private String role;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLoginAt;
    private Instant deletedAt;
}