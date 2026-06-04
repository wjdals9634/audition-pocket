package com.auditionpocket.server.user;

import com.auditionpocket.server.user.dto.UserCreateRequest;
import com.auditionpocket.server.user.dto.UserResponse;
import com.auditionpocket.server.user.dto.UserUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> getUsers() {
        return userService.getUsersForAdmin();
    }

    @GetMapping("/{id}")
    public UserResponse getUser(
            @PathVariable String id
    ) {
        return userService.getUserForAdmin(id);
    }

    @PostMapping
    public UserResponse createUser(
            @Valid @RequestBody UserCreateRequest request
    ) {
        return userService.createUserForAdmin(request);
    }

    @PatchMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable String id,
            @RequestBody UserUpdateRequest request
    ) {
        return userService.updateUserForAdmin(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(
            @PathVariable String id
    ) {
        userService.deleteUserForAdmin(id);
    }
}