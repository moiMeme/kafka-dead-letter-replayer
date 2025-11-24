package com.geopost.coldcontrol.kafka.dlt.monitor.service;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ErrorTypeCount;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ErrorTypeDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.MessageDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.MetricsOverviewDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ServiceCount;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.TimeSeriesCount;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.TopicCount;
import com.geopost.coldcontrol.kafka.dlt.monitor.entity.Message;
import com.geopost.coldcontrol.kafka.dlt.monitor.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DefaultMessageService implements MessageService {

    private final MessageRepository messageRepository;

    @Override
    public List<ErrorTypeDTO> findErrorTypes() {
        return messageRepository.findErrorType();
    }

    @Override
    public Page<MessageDTO> findMessages(Map<String, String> filters, Pageable pageable) {
        Specification<Message> spec = Specification.where(null);

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

        Page<Message> messages = messageRepository.findAll(spec, pageable);

        return messages
                .map(this::mapToDTO);
    }

    @Override
    public Optional<MessageDTO> findMessageById(String messageId) {
        return messageRepository.findById(messageId)
                .map(this::mapToDTO);
    }

    @Override
    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    @Override
    public void incrementReplayCount(String messageId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            message.setReplayCount(message.getReplayCount() + 1);
            message.setLastReplayAt(ZonedDateTime.now());
            messageRepository.save(message);
        });
    }

    @Override
    public boolean deleteMessageByIds(List<String> ids) {
        try {
            messageRepository.deleteAllById(ids);
        } catch (Exception e) {
            log.error("Error in deleting messages ", e);
            return false;
        }
        return true;
    }


    @Override
    public MetricsOverviewDTO getMetricsOverview() {
        ZonedDateTime last24h = ZonedDateTime.now().minusHours(24);

        // Total messages
        long totalMessages = messageRepository.count();

        // Messages in last 24h
        long last24hCount = messageRepository.countMessagesSince(last24h);

        // Top services
        List<ServiceCount> topServices = messageRepository.countByService();

        // DLT by topic
        List<TopicCount> dltByTopic = messageRepository.countByTopic();

        // DLT by error type
        List<ErrorTypeCount> dltByErrorType = messageRepository.countByErrorType();

        // DLT by time (last 7 days)
        List<TimeSeriesCount> dltByTime = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);

            ZonedDateTime start = date
                    .atStartOfDay(ZoneId.of("UTC"));

            ZonedDateTime end = start
                    .plusDays(1)
                    .minusNanos(1);

            long count = messageRepository.countByDay(start, end);
            dltByTime.add(TimeSeriesCount.builder()
                    .date(date.toString())
                    .count(count)
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

    /*public Message saveDltMessage(Message message) {
        return messageRepository.save(message);
    }



    */

    private MessageDTO mapToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId().toString())
                .key(message.getKey())
                .serviceId(message.getServiceId())
                .topic(message.getTopic())
                .timestamp(message.getTimestamp())
                .errorType(message.getErrorType())
                .errorMessage(message.getErrorMessage())
                .errorLocation(message.getErrorLocation())
                .errorCauseTrace(message.getErrorCauseTrace())
                .replayCount(message.getReplayCount())
                .lastReplayAt(message.getLastReplayAt())
                .headers(message.getHeaders())
                .payload(message.getPayload())
                .stacktrace(message.getStacktrace())
                .build();
    }
}
