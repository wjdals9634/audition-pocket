package com.auditionpocket.server.tag;

import com.auditionpocket.server.tag.dto.TagCreateRequest;
import com.auditionpocket.server.tag.dto.TagResponse;
import com.auditionpocket.server.tag.dto.TagUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tags")
@RequiredArgsConstructor
public class AdminTagController {

    private final TagService tagService;

    @GetMapping
    public List<TagResponse> getTags() {
        return tagService.getAllTagsForAdmin();
    }

    @GetMapping("/{id}")
    public TagResponse getTag(
            @PathVariable String id
    ) {
        return tagService.getTagForAdmin(id);
    }

    @PostMapping
    public TagResponse createTag(
            @Valid @RequestBody TagCreateRequest request
    ) {
        return tagService.createTag(request);
    }

    @PatchMapping("/{id}")
    public TagResponse updateTag(
            @PathVariable String id,
            @RequestBody TagUpdateRequest request
    ) {
        return tagService.updateTag(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTag(
            @PathVariable String id
    ) {
        tagService.deleteTag(id);
    }
}