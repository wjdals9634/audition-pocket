package com.auditionpocket.server.common.code;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "common_codes")
public class CommonCode {

    @Id
    private String id;

    private String groupCode;
    private String code;
    private String label;
    private String description;

    private Integer displayOrder;
    private Boolean active;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
}