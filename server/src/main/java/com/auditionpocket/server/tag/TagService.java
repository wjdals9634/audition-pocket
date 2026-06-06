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
        return tagRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .filter(tag -> tag.getDeletedAt() == null)
                .map(TagResponse::from)
                .toList();
    }

    public List<TagResponse> getAllTagsForAdmin() {
        return tagRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .filter(tag -> tag.getDeletedAt() == null)
                .map(TagResponse::from)
                .toList();
    }

    public TagResponse getTagForAdmin(String id) {
        Tag tag = tagRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다."));

        return TagResponse.from(tag);
    }

    public TagResponse createTag(TagCreateRequest request) {
        validateCreateRequest(request);

        Instant now = Instant.now();

        Tag tag = Tag.builder()
                .name(request.name().trim())
                .displayOrder(request.displayOrder())
                .active(resolveActive(request.active()))
                .createdAt(now)
                .updatedAt(now)
                .deletedAt(null)
                .build();

        return TagResponse.from(tagRepository.save(tag));
    }

    public TagResponse updateTag(
            String id,
            TagUpdateRequest request
    ) {
        Tag tag = tagRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다."));

        if (request.name() != null) {
            String nextName = request.name().trim();

            if (nextName.isBlank()) {
                throw new IllegalArgumentException("태그명이 올바르지 않습니다.");
            }

            tag.setName(nextName);
        }

        if (request.displayOrder() != null) {
            validateDisplayOrderForUpdate(
                    request.displayOrder(),
                    id
            );

            tag.setDisplayOrder(request.displayOrder());
        }

        if (request.active() != null) {
            tag.setActive(request.active());
        }

        tag.setUpdatedAt(Instant.now());

        return TagResponse.from(tagRepository.save(tag));
    }

    public void deleteTag(String id) {
        Tag tag = tagRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("태그를 찾을 수 없습니다."));

        tag.setActive(false);
        tag.setDeletedAt(Instant.now());
        tag.setUpdatedAt(Instant.now());

        tagRepository.save(tag);
    }

    public void validateTagIds(List<String> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }

        List<Tag> tags = tagRepository.findByIdInAndActiveTrueAndDeletedAtIsNull(tagIds);

        if (tags.size() != tagIds.size()) {
            throw new IllegalArgumentException("존재하지 않거나 비활성화된 태그가 포함되어 있습니다.");
        }
    }

    private void validateCreateRequest(TagCreateRequest request) {
        if (request.name() == null || request.name().trim().isBlank()) {
            throw new IllegalArgumentException("태그명이 올바르지 않습니다.");
        }

        validateDisplayOrderForCreate(request.displayOrder());

        boolean nameExists = tagRepository.existsByNameAndDeletedAtIsNull(
                request.name().trim()
        );

        if (nameExists) {
            throw new IllegalArgumentException("이미 사용 중인 태그명입니다.");
        }
    }

    private void validateDisplayOrderForCreate(Integer displayOrder) {
        if (displayOrder == null || displayOrder < 1) {
            throw new IllegalArgumentException("노출 순서가 올바르지 않습니다.");
        }

        boolean exists = tagRepository.existsByDisplayOrderAndDeletedAtIsNull(displayOrder);

        if (exists) {
            throw new IllegalArgumentException("이미 사용 중인 노출 순서입니다.");
        }
    }

    private void validateDisplayOrderForUpdate(
            Integer displayOrder,
            String id
    ) {
        if (displayOrder == null || displayOrder < 1) {
            throw new IllegalArgumentException("노출 순서가 올바르지 않습니다.");
        }

        boolean exists = tagRepository.existsByDisplayOrderAndIdNotAndDeletedAtIsNull(
                displayOrder,
                id
        );

        if (exists) {
            throw new IllegalArgumentException("이미 사용 중인 노출 순서입니다.");
        }
    }

    private boolean resolveActive(Boolean active) {
        if (active == null) {
            return true;
        }

        return active;
    }
}