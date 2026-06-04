package com.auditionpocket.server.clip;

import com.auditionpocket.server.clip.dto.AdminClipCreateRequest;
import com.auditionpocket.server.clip.dto.ClipCreateRequest;
import com.auditionpocket.server.clip.dto.ClipResponse;
import com.auditionpocket.server.clip.dto.ClipUpdateRequest;
import com.auditionpocket.server.common.code.CommonCodeRepository;
import com.auditionpocket.server.tag.TagRepository;
import com.auditionpocket.server.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClipService {

    private final ClipRepository clipRepository;
    private final UserRepository userRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final TagRepository tagRepository;

    public List<ClipResponse> getClipsByUserId(String userId) {
        validateUserExists(userId);

        return clipRepository
                .findByUserIdAndHiddenFalseAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                .stream()
                .map(ClipResponse::from)
                .toList();
    }

    public ClipResponse getClipByUserId(String userId, String clipId) {
        validateUserExists(userId);

        Clip clip = clipRepository.findById(clipId)
                .filter(item -> item.getDeletedAt() == null)
                .filter(item -> item.getUserId().equals(userId))
                .filter(item -> Boolean.FALSE.equals(item.getHidden()))
                .orElseThrow(() -> new IllegalArgumentException("공고 스크랩을 찾을 수 없습니다."));

        return ClipResponse.from(clip);
    }

    public ClipResponse createClip(String userId, ClipCreateRequest request) {
        validateUserExists(userId);
        validateSourceCode(request.sourceCode());
        validateStatusCode(request.statusCode());
        validateTagIds(request.tagIds());

        Instant now = Instant.now();

        Clip clip = Clip.builder()
                .userId(userId)
                .title(request.title())
                .sourceCode(request.sourceCode())
                .sourceUrl(request.sourceUrl())
                .deadlineDate(request.deadlineDate())
                .statusCode(request.statusCode())
                .tagIds(normalizeTagIds(request.tagIds()))
                .memo(request.memo())
                .hidden(false)
                .createdAt(now)
                .updatedAt(now)
                .deletedAt(null)
                .build();

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    public ClipResponse updateClipByUserId(String userId, String clipId, ClipUpdateRequest request) {
        validateUserExists(userId);

        Clip clip = clipRepository.findById(clipId)
                .filter(item -> item.getDeletedAt() == null)
                .filter(item -> item.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("공고 스크랩을 찾을 수 없습니다."));

        updateFields(clip, request, false);

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    public void deleteClipByUserId(String userId, String clipId) {
        validateUserExists(userId);

        Clip clip = clipRepository.findById(clipId)
                .filter(item -> item.getDeletedAt() == null)
                .filter(item -> item.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("공고 스크랩을 찾을 수 없습니다."));

        softDelete(clip);
    }

    public List<ClipResponse> getClipsForAdmin() {
        return clipRepository
                .findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(ClipResponse::from)
                .toList();
    }

    public ClipResponse getClipForAdmin(String id) {
        Clip clip = clipRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("공고 스크랩을 찾을 수 없습니다."));

        return ClipResponse.from(clip);
    }

    public ClipResponse createClipForAdmin(AdminClipCreateRequest request) {
        validateUserExists(request.userId());
        validateSourceCode(request.sourceCode());
        validateStatusCode(request.statusCode());
        validateTagIds(request.tagIds());

        Instant now = Instant.now();

        Clip clip = Clip.builder()
                .userId(request.userId())
                .title(request.title())
                .sourceCode(request.sourceCode())
                .sourceUrl(request.sourceUrl())
                .deadlineDate(request.deadlineDate())
                .statusCode(request.statusCode())
                .tagIds(normalizeTagIds(request.tagIds()))
                .memo(request.memo())
                .hidden(false)
                .createdAt(now)
                .updatedAt(now)
                .deletedAt(null)
                .build();

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    public ClipResponse updateClipForAdmin(String id, ClipUpdateRequest request) {
        Clip clip = clipRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("공고 스크랩을 찾을 수 없습니다."));

        updateFields(clip, request, true);

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    public void deleteClipForAdmin(String id) {
        Clip clip = clipRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("공고 스크랩을 찾을 수 없습니다."));

        softDelete(clip);
    }

    public ClipResponse hideClipForAdmin(String id) {
        Clip clip = clipRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("공고 스크랩을 찾을 수 없습니다."));

        clip.setHidden(true);
        clip.setUpdatedAt(Instant.now());

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    public ClipResponse unhideClipForAdmin(String id) {
        Clip clip = clipRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("공고 스크랩을 찾을 수 없습니다."));

        clip.setHidden(false);
        clip.setUpdatedAt(Instant.now());

        Clip saved = clipRepository.save(clip);

        return ClipResponse.from(saved);
    }

    private void updateFields(Clip clip, ClipUpdateRequest request, boolean allowHiddenUpdate) {
        if (request.title() != null) {
            clip.setTitle(request.title());
        }

        if (request.sourceCode() != null) {
            validateSourceCode(request.sourceCode());
            clip.setSourceCode(request.sourceCode());
        }

        if (request.sourceUrl() != null) {
            clip.setSourceUrl(request.sourceUrl());
        }

        if (request.deadlineDate() != null) {
            clip.setDeadlineDate(request.deadlineDate());
        }

        if (request.statusCode() != null) {
            validateStatusCode(request.statusCode());
            clip.setStatusCode(request.statusCode());
        }

        if (request.tagIds() != null) {
            validateTagIds(request.tagIds());
            clip.setTagIds(normalizeTagIds(request.tagIds()));
        }

        if (request.memo() != null) {
            clip.setMemo(request.memo());
        }

        if (allowHiddenUpdate && request.hidden() != null) {
            clip.setHidden(request.hidden());
        }

        clip.setUpdatedAt(Instant.now());
    }

    private void softDelete(Clip clip) {
        Instant now = Instant.now();

        clip.setDeletedAt(now);
        clip.setUpdatedAt(now);

        clipRepository.save(clip);
    }

    private void validateUserExists(String userId) {
        boolean exists = userRepository.findById(userId)
                .filter(user -> user.getDeletedAt() == null)
                .filter(user -> "ACTIVE".equals(user.getStatusCode()))
                .isPresent();

        if (!exists) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
    }

    private void validateSourceCode(String sourceCode) {
        boolean exists = commonCodeRepository
                .findByGroupCodeAndCodeAndDeletedAtIsNull("CLIP_SOURCE", sourceCode)
                .filter(code -> Boolean.TRUE.equals(code.getActive()))
                .isPresent();

        if (!exists) {
            throw new IllegalArgumentException("유효하지 않은 출처 코드입니다.");
        }
    }

    private void validateStatusCode(String statusCode) {
        boolean exists = commonCodeRepository
                .findByGroupCodeAndCodeAndDeletedAtIsNull("CLIP_STATUS", statusCode)
                .filter(code -> Boolean.TRUE.equals(code.getActive()))
                .isPresent();

        if (!exists) {
            throw new IllegalArgumentException("유효하지 않은 상태 코드입니다.");
        }
    }

    private void validateTagIds(List<String> tagIds) {
        List<String> normalizedTagIds = normalizeTagIds(tagIds);

        if (normalizedTagIds.isEmpty()) {
            return;
        }

        long validCount = tagRepository
                .findByIdInAndActiveTrueAndDeletedAtIsNull(normalizedTagIds)
                .size();

        if (validCount != normalizedTagIds.size()) {
            throw new IllegalArgumentException("유효하지 않은 태그가 포함되어 있습니다.");
        }
    }

    private List<String> normalizeTagIds(List<String> tagIds) {
        if (tagIds == null) {
            return new ArrayList<>();
        }

        return tagIds.stream()
                .filter(tagId -> tagId != null && !tagId.isBlank())
                .distinct()
                .toList();
    }
}