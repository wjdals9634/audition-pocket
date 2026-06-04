package com.auditionpocket.server.tag;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TagRepository extends MongoRepository<Tag, String> {

    List<Tag> findByActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAsc();

    List<Tag> findByDeletedAtIsNullOrderByDisplayOrderAsc();

    List<Tag> findByIdInAndActiveTrueAndDeletedAtIsNull(List<String> ids);

    boolean existsByNameAndDeletedAtIsNull(String name);
}