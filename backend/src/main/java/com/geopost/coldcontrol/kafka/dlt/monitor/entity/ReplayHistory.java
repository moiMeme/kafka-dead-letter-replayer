package com.geopost.coldcontrol.kafka.dlt.monitor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.ZonedDateTime;

@Entity
@Table(name = "dlt_messages_replay_history", indexes = {
        @Index(name = "idx_dlt_messages_replay_history", columnList = "messageId")
})
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ReplayHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String messageId;

    @Column(nullable = false)
    private ZonedDateTime replayedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReplayStatus status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        if (replayedAt == null) {
            replayedAt = ZonedDateTime.now();
        }
    }

    public enum ReplayStatus {
        SUCCESS, FAILED
    }
}
