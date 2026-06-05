package com.auditionpocket.server.security;

import com.auditionpocket.server.auth.AuthController;
import com.auditionpocket.server.user.User;
import com.auditionpocket.server.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private static final String USER_STATUS_ACTIVE = "ACTIVE";
    private static final String DEFAULT_ROLE = "USER";

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        HttpSession session = request.getSession(false);

        if (session != null) {
            Object userId = session.getAttribute(AuthController.USER_ID_SESSION_KEY);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                userRepository.findById(userId.toString())
                        .filter(user -> user.getDeletedAt() == null)
                        .filter(user -> USER_STATUS_ACTIVE.equals(user.getStatusCode()))
                        .ifPresent(user -> setAuthentication(user));
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(User user) {
        String role = user.getRole();

        if (role == null || role.isBlank()) {
            role = DEFAULT_ROLE;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getId(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}