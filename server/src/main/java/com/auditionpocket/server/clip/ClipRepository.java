package com.auditionpocket.server.clip;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ClipRepository extends MongoRepository<Clip, String> {

    List<Clip> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(String userId);

    List<Clip> findByUserIdAndHiddenFalseAndDeletedAtIsNullOrderByCreatedAtDesc(String userId);

    List<Clip> findByDeletedAtIsNullOrderByCreatedAtDesc();
}