package com.auditionpocket.server.user;

import com.auditionpocket.server.user.dto.UserCreateRequest;
import com.auditionpocket.server.user.dto.UserResponse;
import com.auditionpocket.server.user.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> getUsersForAdmin() {
        return userRepository
                .findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse getUserForAdmin(String id) {
        User user = userRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return UserResponse.from(user);
    }

    public UserResponse createUserForAdmin(UserCreateRequest request) {
        boolean exists = userRepository.existsByEmailAndDeletedAtIsNull(request.email());

        if (exists) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        Instant now = Instant.now();

        User user = User.builder()
                .email(request.email())
                .passwordHash("{noop}" + request.password())
                .name(request.name())
                .statusCode("ACTIVE")
                .role("USER")
                .createdAt(now)
                .updatedAt(now)
                .lastLoginAt(null)
                .deletedAt(null)
                .build();

        User saved = userRepository.save(user);

        return UserResponse.from(saved);
    }

    public UserResponse updateUserForAdmin(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (request.name() != null) {
            user.setName(request.name());
        }

        if (request.statusCode() != null) {
            user.setStatusCode(request.statusCode());
        }

        user.setUpdatedAt(Instant.now());

        User saved = userRepository.save(user);

        return UserResponse.from(saved);
    }

    public void deleteUserForAdmin(String id) {
        User user = userRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Instant now = Instant.now();

        user.setStatusCode("DELETED");
        user.setDeletedAt(now);
        user.setUpdatedAt(now);

        userRepository.save(user);
    }
}