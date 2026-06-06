package com.auditionpocket.server.tag;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends MongoRepository<Tag, String> {

    List<Tag> findByActiveTrueOrderByDisplayOrderAsc();

    List<Tag> findAllByOrderByDisplayOrderAsc();

    List<Tag> findByIdInAndActiveTrueAndDeletedAtIsNull(List<String> ids);

    Optional<Tag> findByIdAndDeletedAtIsNull(String id);

    boolean existsByNameAndDeletedAtIsNull(String name);

    boolean existsByDisplayOrderAndDeletedAtIsNull(Integer displayOrder);

    boolean existsByDisplayOrderAndIdNotAndDeletedAtIsNull(
            Integer displayOrder,
            String id
    );
}