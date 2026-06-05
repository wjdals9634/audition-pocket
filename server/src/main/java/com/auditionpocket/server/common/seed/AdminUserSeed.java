package com.auditionpocket.server.common.seed;

import com.auditionpocket.server.user.User;
import com.auditionpocket.server.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Order(2)
public class AdminUserSeed implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@auditionpocket.com";
    private static final String ADMIN_PASSWORD = "admin1234";

    private static final String USER_STATUS_ACTIVE = "ACTIVE";
    private static final String ACCOUNT_TYPE_REGISTERED = "REGISTERED";
    private static final String ROLE_ADMIN = "ADMIN";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        boolean exists = userRepository
                .findByEmailAndDeletedAtIsNull(ADMIN_EMAIL)
                .isPresent();

        if (exists) {
            return;
        }

        Instant now = Instant.now();

        User admin = User.builder()
                .email(ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
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