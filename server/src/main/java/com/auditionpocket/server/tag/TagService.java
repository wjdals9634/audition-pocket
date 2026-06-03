package com.auditionpocket.server.tag;

import com.auditionpocket.server.tag.dto.TagCreateRequest;
import com.auditionpocket.server.tag.dto.TagResponse;
import com.auditionpocket.server.tag.dto.TagUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<TagResponse> getActiveTags() {
        return tagRepository
                .findByActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAsc()
                .stream()
                .map(TagResponse::from)
                .toList();
    }

    public List<TagResponse> getAllTagsForAdmin() {
        return tagRepository
                .findByDeletedAtIsNullOrderByDisplayOrderAsc()
                .stream()
                .map(TagResponse::from)
                .toList();
    }

    public TagResponse getTagForAdmin(String id) {
        Tag tag = tagRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다."));

        return TagResponse.from(tag);
    }

    public TagResponse createTag(TagCreateRequest request) {
        boolean exists = tagRepository.existsByNameAndDeletedAtIsNull(request.name());

        if (exists) {
            throw new IllegalArgumentException("이미 존재하는 태그입니다.");
        }

        Instant now = Instant.now();

        Tag tag = Tag.builder()
                .name(request.name())
                .displayOrder(request.displayOrder())
                .active(request.active())
                .createdAt(now)
                .updatedAt(now)
                .deletedAt(null)
                .build();

        Tag saved = tagRepository.save(tag);

        return TagResponse.from(saved);
    }

    public TagResponse updateTag(String id, TagUpdateRequest request) {
        Tag tag = tagRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다."));

        if (request.name() != null) {
            tag.setName(request.name());
        }

        if (request.displayOrder() != null) {
            tag.setDisplayOrder(request.displayOrder());
        }

        if (request.active() != null) {
            tag.setActive(request.active());
        }

        tag.setUpdatedAt(Instant.now());

        Tag saved = tagRepository.save(tag);

        return TagResponse.from(saved);
    }

    public void deleteTag(String id) {
        Tag tag = tagRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다."));

        Instant now = Instant.now();

        tag.setActive(false);
        tag.setDeletedAt(now);
        tag.setUpdatedAt(now);

        tagRepository.save(tag);
    }
}