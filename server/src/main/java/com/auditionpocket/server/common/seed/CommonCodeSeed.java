package com.auditionpocket.server.common.seed;

import com.auditionpocket.server.common.code.CommonCode;
import com.auditionpocket.server.common.code.CommonCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Order(1)
public class CommonCodeSeed implements CommandLineRunner {

    private final CommonCodeRepository commonCodeRepository;

    @Override
    public void run(String... args) {
        seedClipStatuses();
        seedClipSources();
    }

    private void seedClipStatuses() {
        createIfNotExists(
                "CLIP_STATUS",
                "SAVED",
                "저장함",
                "공고를 저장만 해둔 상태",
                1
        );

        createIfNotExists(
                "CLIP_STATUS",
                "PREPARING",
                "준비 중",
                "지원 준비 중인 상태",
                2
        );

        createIfNotExists(
                "CLIP_STATUS",
                "SUBMITTED",
                "지원 완료",
                "지원서를 제출한 상태",
                3
        );

        createIfNotExists(
                "CLIP_STATUS",
                "WAITING_CALLBACK",
                "콜백 대기",
                "콜백 결과를 기다리는 상태",
                4
        );

        createIfNotExists(
                "CLIP_STATUS",
                "CALLBACK_RECEIVED",
                "콜백 받음",
                "콜백 연락을 받은 상태",
                5
        );

        createIfNotExists(
                "CLIP_STATUS",
                "ACCEPTED",
                "합격",
                "합격한 상태",
                6
        );

        createIfNotExists(
                "CLIP_STATUS",
                "REJECTED",
                "불합격",
                "불합격한 상태",
                7
        );

        createIfNotExists(
                "CLIP_STATUS",
                "HOLD",
                "보류",
                "판단을 보류한 상태",
                8
        );
    }

    private void seedClipSources() {
        createIfNotExists(
                "CLIP_SOURCE",
                "OTR",
                "OTR",
                "OTR에서 가져온 공고",
                1
        );

        createIfNotExists(
                "CLIP_SOURCE",
                "FILMMAKERS",
                "필름메이커스",
                "필름메이커스에서 가져온 공고",
                2
        );

        createIfNotExists(
                "CLIP_SOURCE",
                "INSTAGRAM",
                "인스타그램",
                "인스타그램에서 가져온 공고",
                3
        );

        createIfNotExists(
                "CLIP_SOURCE",
                "YOUTUBE",
                "유튜브",
                "유튜브에서 가져온 공고",
                4
        );

        createIfNotExists(
                "CLIP_SOURCE",
                "KAKAO",
                "카카오톡/단톡방",
                "카카오톡 또는 단톡방에서 공유된 공고",
                5
        );

        createIfNotExists(
                "CLIP_SOURCE",
                "OTHER",
                "기타",
                "기타 출처의 공고",
                6
        );
    }

    private void createIfNotExists(
            String groupCode,
            String code,
            String label,
            String description,
            Integer displayOrder
    ) {
        boolean exists = commonCodeRepository.existsByGroupCodeAndCodeAndDeletedAtIsNull(
                groupCode,
                code
        );

        if (exists) {
            return;
        }

        Instant now = Instant.now();

        CommonCode commonCode = CommonCode.builder()
                .groupCode(groupCode)
                .code(code)
                .label(label)
                .description(description)
                .displayOrder(displayOrder)
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .deletedAt(null)
                .build();

        commonCodeRepository.save(commonCode);
    }
}