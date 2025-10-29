package com.kafka.dlt.replayer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "replay_history", indexes = {
    @Index(name = "idx_message_id", columnList = "messageId")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplayHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String messageId;

    @Column(nullable = false)
    private LocalDateTime replayedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReplayStatus status;

    @Column(nullable = false)
    private String replayedBy;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        if (replayedAt == null) {
            replayedAt = LocalDateTime.now();
        }
    }

    public enum ReplayStatus {
        SUCCESS, FAILED
    }
}
