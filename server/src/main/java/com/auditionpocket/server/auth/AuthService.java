package com.auditionpocket.server.auth;

import com.auditionpocket.server.auth.dto.AuthUserResponse;
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

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthUserResponse signup(SignupRequest request) {
        boolean exists = userRepository.existsByEmailAndDeletedAtIsNull(request.email());

        if (exists) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        Instant now = Instant.now();

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .statusCode("ACTIVE")
                .role("USER")
                .createdAt(now)
                .updatedAt(now)
                .lastLoginAt(null)
                .deletedAt(null)
                .build();

        User saved = userRepository.save(user);

        return AuthUserResponse.from(saved);
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.email())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!"ACTIVE".equals(user.getStatusCode())) {
            throw new IllegalArgumentException("이용할 수 없는 사용자입니다.");
        }

        boolean matches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!matches) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        return userRepository.save(user);
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .filter(user -> user.getDeletedAt() == null)
                .filter(user -> "ACTIVE".equals(user.getStatusCode()))
                .orElseThrow(() -> new IllegalArgumentException("로그인 사용자를 찾을 수 없습니다."));
    }
}