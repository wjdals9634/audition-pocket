package com.auditionpocket.server.common.code;

import com.auditionpocket.server.common.code.dto.CommonCodeCreateRequest;
import com.auditionpocket.server.common.code.dto.CommonCodeResponse;
import com.auditionpocket.server.common.code.dto.CommonCodeUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommonCodeService {

    private final CommonCodeRepository commonCodeRepository;

    public List<CommonCodeResponse> getActiveCodesByGroupCode(String groupCode) {
        return commonCodeRepository
                .findByGroupCodeAndActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAsc(groupCode)
                .stream()
                .map(CommonCodeResponse::from)
                .toList();
    }

    public List<CommonCodeResponse> getAllCodesForAdmin() {
        return commonCodeRepository
                .findByDeletedAtIsNullOrderByGroupCodeAscDisplayOrderAsc()
                .stream()
                .map(CommonCodeResponse::from)
                .toList();
    }

    public CommonCodeResponse getCodeForAdmin(String id) {
        CommonCode commonCode = commonCodeRepository.findById(id)
                .filter(code -> code.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("공통 코드를 찾을 수 없습니다."));

        return CommonCodeResponse.from(commonCode);
    }

    public CommonCodeResponse createCode(CommonCodeCreateRequest request) {
        boolean exists = commonCodeRepository.existsByGroupCodeAndCodeAndDeletedAtIsNull(
                request.groupCode(),
                request.code()
        );

        if (exists) {
            throw new IllegalArgumentException("이미 존재하는 공통 코드입니다.");
        }

        Instant now = Instant.now();

        CommonCode commonCode = CommonCode.builder()
                .groupCode(request.groupCode())
                .code(request.code())
                .label(request.label())
                .description(request.description())
                .displayOrder(request.displayOrder())
                .active(request.active())
                .createdAt(now)
                .updatedAt(now)
                .deletedAt(null)
                .build();

        CommonCode saved = commonCodeRepository.save(commonCode);

        return CommonCodeResponse.from(saved);
    }

    public CommonCodeResponse updateCode(String id, CommonCodeUpdateRequest request) {
        CommonCode commonCode = commonCodeRepository.findById(id)
                .filter(code -> code.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("공통 코드를 찾을 수 없습니다."));

        if (request.label() != null) {
            commonCode.setLabel(request.label());
        }

        if (request.description() != null) {
            commonCode.setDescription(request.description());
        }

        if (request.displayOrder() != null) {
            commonCode.setDisplayOrder(request.displayOrder());
        }

        if (request.active() != null) {
            commonCode.setActive(request.active());
        }

        commonCode.setUpdatedAt(Instant.now());

        CommonCode saved = commonCodeRepository.save(commonCode);

        return CommonCodeResponse.from(saved);
    }

    public void deleteCode(String id) {
        CommonCode commonCode = commonCodeRepository.findById(id)
                .filter(code -> code.getDeletedAt() == null)
                .orElseThrow(() -> new IllegalArgumentException("공통 코드를 찾을 수 없습니다."));

        Instant now = Instant.now();

        commonCode.setActive(false);
        commonCode.setDeletedAt(now);
        commonCode.setUpdatedAt(now);

        commonCodeRepository.save(commonCode);
    }
}