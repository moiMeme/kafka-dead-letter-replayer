package com.geopost.coldcontrol.kafka.dlt.monitor.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "dlt_messages", indexes = {
        @Index(name = "idx_service_id", columnList = "serviceId"),
        @Index(name = "idx_topic", columnList = "topic"),
        @Index(name = "idx_error_type", columnList = "errorType"),
        @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Builder
@Getter
@Setter
@ToString(exclude = {"createdBy", "creationDate", "lastUpdateBy", "lastUpdateOn"})
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String key;

    @Column(nullable = false)
    private String serviceId;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private ZonedDateTime timestamp;

    private String errorType;

    private String errorMessage;

    private String errorLocation;

    private String errorCauseTrace;

    @Column(nullable = false)
    @Builder.Default
    private Integer replayCount = 0;

    private ZonedDateTime lastReplayAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> headers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(columnDefinition = "TEXT")
    private String stacktrace;

    @Column(name = "created_by", updatable = false)
    @Builder.Default
    private String createdBy = "SYSTEM";

    @Column(name = "creation_date", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    @Builder.Default
    private ZonedDateTime creationDate = ZonedDateTime.now();

    @Column(name = "last_update_by")
    private String lastUpdateBy;

    @Column(name = "last_update_on")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private ZonedDateTime lastUpdateOn;

    @PrePersist
    protected void onCreate() {
        if (Objects.isNull(creationDate)) {
            creationDate = ZonedDateTime.now();
        }

        if (Objects.isNull(createdBy)) {
            createdBy = "SYSTEM";
        }

        if (Objects.isNull(replayCount)) {
            replayCount = 0;
        }

    }
    
    @PreUpdate
    protected void onUpdate() {
        lastUpdateOn = ZonedDateTime.now();

        if (Objects.isNull(lastUpdateBy)) {
            lastUpdateBy = "SYSTEM";
        }
    }
}