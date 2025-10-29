package com.kafka.dlt.replayer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplayRequest {
    private List<String> messageIds;
    private Map<String, String> headers;
}
