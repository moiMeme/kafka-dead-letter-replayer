package com.kafka.dlt.replayer.service;

import com.kafka.dlt.replayer.dto.MessageDTO;
import com.kafka.dlt.replayer.dto.MetricsOverviewDTO;
import com.kafka.dlt.replayer.entity.DltMessage;
import com.kafka.dlt.replayer.entity.Service;
import com.kafka.dlt.replayer.repository.DltMessageRepository;
import com.kafka.dlt.replayer.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class DltMessageService {

    private final DltMessageRepository messageRepository;
    private final ServiceRepository serviceRepository;

    public List<MessageDTO> findMessages(Map<String, String> filters) {
        Specification<DltMessage> spec = Specification.where(null);

        if (filters.containsKey("serviceId") && filters.get("serviceId") != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("serviceId"), filters.get("serviceId")));
        }

        if (filters.containsKey("topic") && filters.get("topic") != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("topic"), filters.get("topic")));
        }

        if (filters.containsKey("errorType") && filters.get("errorType") != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("errorType"), filters.get("errorType")));
        }

        if (filters.containsKey("key_like") && filters.get("key_like") != null) {
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("key")), "%" + filters.get("key_like").toLowerCase() + "%"));
        }

        // Sort by timestamp descending
        List<DltMessage> messages = messageRepository.findAll(spec,
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"));

        return messages.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public MessageDTO findById(String id) {
        return messageRepository.findById(id)
            .map(this::convertToDTO)
            .orElse(null);
    }

    public DltMessage saveDltMessage(DltMessage message) {
        return messageRepository.save(message);
    }

    public void incrementReplayCount(String messageId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            message.setReplayCount(message.getReplayCount() + 1);
            message.setLastReplayAt(LocalDateTime.now());
            messageRepository.save(message);
        });
    }

    public MetricsOverviewDTO getMetricsOverview() {
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        // Total messages
        Long totalMessages = messageRepository.count();

        // Messages in last 24h
        Long last24hCount = messageRepository.countMessagesSince(last24h);

        // Top services
        Map<String, String> serviceIdToName = serviceRepository.findAll().stream()
            .collect(Collectors.toMap(Service::getId, Service::getName));

        List<MetricsOverviewDTO.ServiceCount> topServices = messageRepository.findAll().stream()
            .collect(Collectors.groupingBy(DltMessage::getServiceId, Collectors.counting()))
            .entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(3)
            .map(entry -> MetricsOverviewDTO.ServiceCount.builder()
                .serviceName(serviceIdToName.getOrDefault(entry.getKey(), entry.getKey()))
                .count(entry.getValue())
                .build())
            .collect(Collectors.toList());

        // DLT by topic
        List<MetricsOverviewDTO.TopicCount> dltByTopic = messageRepository.countByTopic().stream()
            .map(tc -> MetricsOverviewDTO.TopicCount.builder()
                .topic(tc.getTopic())
                .count(tc.getCount())
                .build())
            .limit(10)
            .collect(Collectors.toList());

        // DLT by error type
        List<MetricsOverviewDTO.ErrorTypeCount> dltByErrorType = messageRepository.countByErrorType().stream()
            .map(etc -> MetricsOverviewDTO.ErrorTypeCount.builder()
                .errorType(etc.getErrorType())
                .count(etc.getCount())
                .build())
            .collect(Collectors.toList());

        // DLT by time (last 7 days)
        List<MetricsOverviewDTO.TimeSeriesCount> dltByTime = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();

            Long count = messageRepository.findByTimestampBetween(start, end).size();
            dltByTime.add(MetricsOverviewDTO.TimeSeriesCount.builder()
                .date(date.toString())
                .count((long) count)
                .build());
        }

        return MetricsOverviewDTO.builder()
            .totalDltMessages(totalMessages)
            .dltLast24h(last24hCount)
            .topServices(topServices)
            .dltByTopic(dltByTopic)
            .dltByErrorType(dltByErrorType)
            .dltByTime(dltByTime)
            .build();
    }

    private MessageDTO convertToDTO(DltMessage message) {
        return MessageDTO.builder()
            .id(message.getId())
            .key(message.getKey())
            .serviceId(message.getServiceId())
            .topic(message.getTopic())
            .timestamp(message.getTimestamp().format(DateTimeFormatter.ISO_DATE_TIME))
            .errorType(message.getErrorType())
            .replayCount(message.getReplayCount())
            .lastReplayAt(message.getLastReplayAt() != null ?
                message.getLastReplayAt().format(DateTimeFormatter.ISO_DATE_TIME) : null)
            .headers(message.getHeaders())
            .payload(message.getPayload())
            .stacktrace(message.getStacktrace())
            .build();
    }
}
