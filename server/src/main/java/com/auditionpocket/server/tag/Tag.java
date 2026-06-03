package com.auditionpocket.server.tag;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tags")
public class Tag {

    @Id
    private String id;

    private String name;

    private Integer displayOrder;
    private Boolean active;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
}