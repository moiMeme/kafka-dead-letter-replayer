package com.geopost.coldcontrol.kafka.dlt.monitor.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record ServiceDTO(String id, String name, List<TopicDTO> topics) {
}
