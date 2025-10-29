package com.kafka.dlt.replayer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricsOverviewDTO {
    private Long totalDltMessages;
    private Long dltLast24h;
    private List<ServiceCount> topServices;
    private List<TopicCount> dltByTopic;
    private List<ErrorTypeCount> dltByErrorType;
    private List<TimeSeriesCount> dltByTime;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceCount {
        private String serviceName;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicCount {
        private String topic;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorTypeCount {
        private String errorType;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesCount {
        private String date;
        private Long count;
    }
}
