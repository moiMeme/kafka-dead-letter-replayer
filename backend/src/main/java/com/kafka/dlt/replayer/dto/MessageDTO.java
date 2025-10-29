package com.kafka.dlt.replayer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private String id;
    private String key;
    private String serviceId;
    private String topic;
    private String timestamp;  // ISO-8601 format for frontend
    private String errorType;
    private Integer replayCount;
    private String lastReplayAt;  // ISO-8601 format for frontend
    private Map<String, String> headers;
    private Map<String, Object> payload;
    private String stacktrace;
}
