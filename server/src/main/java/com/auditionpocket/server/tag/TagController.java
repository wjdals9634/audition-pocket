package com.auditionpocket.server.tag;

import com.auditionpocket.server.tag.dto.TagResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public List<TagResponse> getTags() {
        return tagService.getActiveTags();
    }
}