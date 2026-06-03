package com.auditionpocket.server.common.code;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CommonCodeRepository extends MongoRepository<CommonCode, String> {

    List<CommonCode> findByGroupCodeAndActiveTrueAndDeletedAtIsNullOrderByDisplayOrderAsc(
            String groupCode
    );

    List<CommonCode> findByDeletedAtIsNullOrderByGroupCodeAscDisplayOrderAsc();

    Optional<CommonCode> findByGroupCodeAndCodeAndDeletedAtIsNull(
            String groupCode,
            String code
    );

    boolean existsByGroupCodeAndCodeAndDeletedAtIsNull(
            String groupCode,
            String code
    );
}