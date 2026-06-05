package com.auditionpocket.server.auth;

import com.auditionpocket.server.auth.dto.LinkEmailRequest;

import com.auditionpocket.server.auth.dto.LoginRequest;

import com.auditionpocket.server.auth.dto.SignupRequest;

import com.auditionpocket.server.user.User;

import com.auditionpocket.server.user.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.time.Instant;

@Service

@RequiredArgsConstructor

public class AuthService {

    private static final String USER_STATUS_ACTIVE = "ACTIVE";

    private static final String ACCOUNT_TYPE_GUEST = "GUEST";

    private static final String ACCOUNT_TYPE_REGISTERED = "REGISTERED";

    private static final String ROLE_USER = "USER";

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public User signup(SignupRequest request) {

        validateEmailNotExists(request.email());

        Instant now = Instant.now();

        User user = User.builder()

                .email(request.email())

                .passwordHash(passwordEncoder.encode(request.password()))

                .name(request.name())

                .statusCode(USER_STATUS_ACTIVE)

                .accountType(ACCOUNT_TYPE_REGISTERED)

                .role(ROLE_USER)

                .createdAt(now)

                .updatedAt(now)

                .lastLoginAt(now)

                .deletedAt(null)

                .build();

        return userRepository.save(user);

    }

    public User login(LoginRequest request) {

        User user = userRepository.findByEmailAndDeletedAtIsNull(request.email())

                .filter(item -> USER_STATUS_ACTIVE.equals(item.getStatusCode()))

                .filter(item -> ACCOUNT_TYPE_REGISTERED.equals(item.getAccountType()))

                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        boolean passwordMatches = passwordEncoder.matches(

                request.password(),

                user.getPasswordHash()

        );

        if (!passwordMatches) {

            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");

        }

        user.setLastLoginAt(Instant.now());

        user.setUpdatedAt(Instant.now());

        return userRepository.save(user);

    }

    public User createGuest() {

        Instant now = Instant.now();

        User user = User.builder()

                .email(null)

                .passwordHash(null)

                .name("게스트")

                .statusCode(USER_STATUS_ACTIVE)

                .accountType(ACCOUNT_TYPE_GUEST)

                .role(ROLE_USER)

                .createdAt(now)

                .updatedAt(now)

                .lastLoginAt(now)

                .deletedAt(null)

                .build();

        return userRepository.save(user);

    }

    public User linkEmail(

            String currentUserId,

            LinkEmailRequest request

    ) {

        User user = userRepository.findById(currentUserId)

                .filter(item -> item.getDeletedAt() == null)

                .filter(item -> USER_STATUS_ACTIVE.equals(item.getStatusCode()))

                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!ACCOUNT_TYPE_GUEST.equals(user.getAccountType())) {

            throw new IllegalArgumentException("이미 이메일 연동이 완료된 사용자입니다.");

        }

        validateEmailNotExists(request.email());

        user.setEmail(request.email());

        user.setPasswordHash(passwordEncoder.encode(request.password()));

        user.setName(request.name());

        user.setAccountType(ACCOUNT_TYPE_REGISTERED);

        user.setUpdatedAt(Instant.now());

        user.setLastLoginAt(Instant.now());

        return userRepository.save(user);

    }

    public User getUserById(String userId) {

        return userRepository.findById(userId)

                .filter(user -> user.getDeletedAt() == null)

                .filter(user -> USER_STATUS_ACTIVE.equals(user.getStatusCode()))

                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

    }

    private void validateEmailNotExists(String email) {

        boolean exists = userRepository

                .findByEmailAndDeletedAtIsNull(email)

                .isPresent();

        if (exists) {

            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");

        }

    }

}