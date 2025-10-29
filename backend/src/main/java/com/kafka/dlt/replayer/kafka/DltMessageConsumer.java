package com.kafka.dlt.replayer.kafka;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kafka.dlt.replayer.entity.DltMessage;
import com.kafka.dlt.replayer.service.DltMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DltMessageConsumer {

    private final DltMessageService messageService;
    private final ObjectMapper objectMapper;

    /**
     * Listens to all topics ending with .dlt
     * This uses topic pattern matching in Kafka
     */
    @KafkaListener(
        topicPattern = ".*\\.dlt",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeDltMessage(
        ConsumerRecord<String, String> record,
        @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
        @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key,
        @Header(value = KafkaHeaders.RECEIVED_TIMESTAMP, required = false) Long timestamp
    ) {
        try {
            log.info("Received DLT message from topic: {}, key: {}", topic, key);

            // Extract service ID from topic name
            // Example: payment.created.dlt -> payment-service
            String serviceId = extractServiceIdFromTopic(topic);

            // Parse payload
            Map<String, Object> payload = objectMapper.readValue(
                record.value(),
                new TypeReference<Map<String, Object>>() {}
            );

            // Extract headers
            Map<String, String> headers = new HashMap<>();
            record.headers().forEach(header -> {
                headers.put(header.key(), new String(header.value()));
            });

            // Extract error information from headers or payload
            String errorType = headers.getOrDefault("X-Error-Type", "UnknownException");
            String stacktrace = headers.getOrDefault("X-Stacktrace", "No stacktrace available");

            // Create DLT message entity
            DltMessage dltMessage = DltMessage.builder()
                .id("msg-" + UUID.randomUUID().toString().substring(0, 8))
                .key(key != null ? key : "unknown-key")
                .serviceId(serviceId)
                .topic(topic)
                .timestamp(timestamp != null ?
                    LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault()) :
                    LocalDateTime.now())
                .errorType(errorType)
                .replayCount(0)
                .headers(headers)
                .payload(payload)
                .stacktrace(stacktrace)
                .build();

            // Save to database
            messageService.saveDltMessage(dltMessage);

            log.info("Successfully saved DLT message with ID: {}", dltMessage.getId());

        } catch (Exception e) {
            log.error("Error processing DLT message from topic {}: {}", topic, e.getMessage(), e);
        }
    }

    /**
     * Extracts service ID from topic name
     * Examples:
     * - payment.created.dlt -> payment-service
     * - order.updated.dlt -> order-service
     */
    private String extractServiceIdFromTopic(String topic) {
        String[] parts = topic.split("\\.");
        if (parts.length > 0) {
            return parts[0] + "-service";
        }
        return "unknown-service";
    }
}
