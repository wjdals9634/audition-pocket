package com.auditionpocket.server.auth;

import com.auditionpocket.server.auth.dto.AuthUserResponse;
import com.auditionpocket.server.auth.dto.LoginRequest;
import com.auditionpocket.server.auth.dto.SignupRequest;
import com.auditionpocket.server.user.User;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    public static final String USER_ID_SESSION_KEY = "USER_ID";

    private final AuthService authService;

    @PostMapping("/signup")
    public AuthUserResponse signup(
            @Valid @RequestBody SignupRequest request,
            HttpSession session
    ) {
        AuthUserResponse response = authService.signup(request);

        session.setAttribute(USER_ID_SESSION_KEY, response.id());

        return response;
    }

    @PostMapping("/login")
    public AuthUserResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpSession session
    ) {
        User user = authService.login(request);

        session.setAttribute(USER_ID_SESSION_KEY, user.getId());

        return AuthUserResponse.from(user);
    }

    @PostMapping("/logout")
    public void logout(
            HttpSession session,
            HttpServletResponse response
    ) {
        session.invalidate();

        response.addHeader(
                "Set-Cookie",
                "JSESSIONID=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
        );
    }

    @GetMapping("/me")
    public AuthUserResponse me(HttpSession session) {
        Object userId = session.getAttribute(USER_ID_SESSION_KEY);

        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        User user = authService.getUserById(userId.toString());

        return AuthUserResponse.from(user);
    }
}