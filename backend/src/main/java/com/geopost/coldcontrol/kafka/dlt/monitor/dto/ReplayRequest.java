package com.geopost.coldcontrol.kafka.dlt.monitor.dto;

import lombok.Builder;

import java.util.Map;

@Builder
public record ReplayRequest(
        String messageIds,
        String payload,
        Map<String, String> headers) {
}
