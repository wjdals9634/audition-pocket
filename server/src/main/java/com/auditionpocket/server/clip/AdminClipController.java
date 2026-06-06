package com.auditionpocket.server.clip;

import com.auditionpocket.server.clip.dto.AdminClipCreateRequest;
import com.auditionpocket.server.clip.dto.AdminClipResponse;
import com.auditionpocket.server.clip.dto.ClipResponse;
import com.auditionpocket.server.clip.dto.ClipUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/clips")
@RequiredArgsConstructor
public class AdminClipController {

    private final ClipService clipService;

    @GetMapping
    public List<AdminClipResponse> getClips() {
        return clipService.getClipsForAdmin();
    }

    @GetMapping("/{id}")
    public AdminClipResponse getClip(
            @PathVariable String id
    ) {
        return clipService.getClipForAdmin(id);
    }

    @PostMapping
    public ClipResponse createClip(
            @Valid @RequestBody AdminClipCreateRequest request
    ) {
        return clipService.createClipForAdmin(request);
    }

    @PatchMapping("/{id}")
    public AdminClipResponse updateClip(
            @PathVariable String id,
            @RequestBody ClipUpdateRequest request
    ) {
        return clipService.updateClipForAdmin(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteClip(
            @PathVariable String id
    ) {
        clipService.deleteClipForAdmin(id);
    }

    @PatchMapping("/{id}/hide")
    public AdminClipResponse hideClip(
            @PathVariable String id
    ) {
        return clipService.hideClipForAdmin(id);
    }

    @PatchMapping("/{id}/unhide")
    public AdminClipResponse unhideClip(
            @PathVariable String id
    ) {
        return clipService.unhideClipForAdmin(id);
    }
}