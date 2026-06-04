package com.auditionpocket.server.clip;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "clips")
public class Clip {

    @Id
    private String id;

    private String userId;

    private String title;

    private String sourceCode;
    private String sourceUrl;

    private LocalDate deadlineDate;

    private String statusCode;

    private List<String> tagIds;

    private String memo;

    private Boolean hidden;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
}