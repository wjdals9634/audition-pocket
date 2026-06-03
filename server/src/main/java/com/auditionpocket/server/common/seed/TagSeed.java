package com.auditionpocket.server.common.seed;

import com.auditionpocket.server.tag.Tag;
import com.auditionpocket.server.tag.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Order(2)
public class TagSeed implements CommandLineRunner {

    private final TagRepository tagRepository;

    @Override
    public void run(String... args) {
        createIfNotExists("뮤지컬", 1);
        createIfNotExists("연극", 2);
        createIfNotExists("영화", 3);
        createIfNotExists("드라마", 4);
        createIfNotExists("광고", 5);
        createIfNotExists("무용", 6);
        createIfNotExists("보컬", 7);
        createIfNotExists("아역", 8);
        createIfNotExists("성인", 9);
        createIfNotExists("기타", 10);
    }

    private void createIfNotExists(
            String name,
            Integer displayOrder
    ) {
        boolean exists = tagRepository.existsByNameAndDeletedAtIsNull(name);

        if (exists) {
            return;
        }

        Instant now = Instant.now();

        Tag tag = Tag.builder()
                .name(name)
                .displayOrder(displayOrder)
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .deletedAt(null)
                .build();

        tagRepository.save(tag);
    }
}