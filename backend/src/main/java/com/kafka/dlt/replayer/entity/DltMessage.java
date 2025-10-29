package com.kafka.dlt.replayer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "dlt_messages", indexes = {
    @Index(name = "idx_service_id", columnList = "serviceId"),
    @Index(name = "idx_topic", columnList = "topic"),
    @Index(name = "idx_error_type", columnList = "errorType"),
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DltMessage {

    @Id
    private String id;

    @Column(nullable = false, name = "message_key")
    private String key;

    @Column(nullable = false)
    private String serviceId;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String errorType;

    @Column(nullable = false)
    @Builder.Default
    private Integer replayCount = 0;

    private LocalDateTime lastReplayAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> headers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> payload;

    @Column(columnDefinition = "TEXT")
    private String stacktrace;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (replayCount == null) {
            replayCount = 0;
        }
    }
}
