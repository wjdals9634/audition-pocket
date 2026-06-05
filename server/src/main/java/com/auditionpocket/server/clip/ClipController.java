package com.auditionpocket.server.clip;

import com.auditionpocket.server.auth.AuthController;
import com.auditionpocket.server.clip.dto.ClipCreateRequest;
import com.auditionpocket.server.clip.dto.ClipResponse;
import com.auditionpocket.server.clip.dto.ClipSearchCondition;
import com.auditionpocket.server.clip.dto.ClipSortType;
import com.auditionpocket.server.clip.dto.ClipUpdateRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clips")
@RequiredArgsConstructor
public class ClipController {

    private final ClipService clipService;

    @GetMapping
    public List<ClipResponse> getClips(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String statusCode,
            @RequestParam(required = false) String sourceCode,
            @RequestParam(required = false) ClipSortType sort,
            HttpSession session
    ) {
        String userId = getLoginUserId(session);

        ClipSearchCondition condition = new ClipSearchCondition(
                keyword,
                statusCode,
                sourceCode,
                sort
        );

        return clipService.getClipsByUserId(userId, condition);
    }

    @GetMapping("/{id}")
    public ClipResponse getClip(
            @PathVariable String id,
            HttpSession session
    ) {
        String userId = getLoginUserId(session);

        return clipService.getClipByUserId(userId, id);
    }

    @PostMapping
    public ClipResponse createClip(
            @Valid @RequestBody ClipCreateRequest request,
            HttpSession session
    ) {
        String userId = getLoginUserId(session);

        return clipService.createClip(userId, request);
    }

    @PatchMapping("/{id}")
    public ClipResponse updateClip(
            @PathVariable String id,
            @RequestBody ClipUpdateRequest request,
            HttpSession session
    ) {
        String userId = getLoginUserId(session);

        return clipService.updateClipByUserId(userId, id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteClip(
            @PathVariable String id,
            HttpSession session
    ) {
        String userId = getLoginUserId(session);

        clipService.deleteClipByUserId(userId, id);
    }

    private String getLoginUserId(HttpSession session) {
        Object userId = session.getAttribute(AuthController.USER_ID_SESSION_KEY);

        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return userId.toString();
    }
}