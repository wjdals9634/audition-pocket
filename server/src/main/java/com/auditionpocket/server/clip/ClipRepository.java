package com.auditionpocket.server.clip;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ClipRepository extends MongoRepository<Clip, String> {

    List<Clip> findByUserIdAndHiddenFalseAndDeletedAtIsNullOrderByCreatedAtDesc(String userId);

    List<Clip> findByUserIdAndHiddenFalseAndDeletedAtIsNullOrderByDeadlineDateAsc(String userId);

    List<Clip> findByDeletedAtIsNullOrderByCreatedAtDesc();
}