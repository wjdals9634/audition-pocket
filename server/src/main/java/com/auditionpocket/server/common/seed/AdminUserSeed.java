package com.auditionpocket.server.common.seed;

import com.auditionpocket.server.user.User;
import com.auditionpocket.server.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Order(2)
public class AdminUserSeed implements CommandLineRunner {

    private static final String USER_STATUS_ACTIVE = "ACTIVE";
    private static final String ACCOUNT_TYPE_REGISTERED = "REGISTERED";
    private static final String ROLE_ADMIN = "ADMIN";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@auditionpocket.com}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        boolean exists = userRepository
                .findByEmailAndDeletedAtIsNull(adminEmail)
                .isPresent();

        if (exists) {
            return;
        }

        Instant now = Instant.now();

        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .name("관리자")
                .statusCode(USER_STATUS_ACTIVE)
                .accountType(ACCOUNT_TYPE_REGISTERED)
                .role(ROLE_ADMIN)
                .createdAt(now)
                .updatedAt(now)
                .lastLoginAt(null)
                .deletedAt(null)
                .build();

        userRepository.save(admin);
    }
}