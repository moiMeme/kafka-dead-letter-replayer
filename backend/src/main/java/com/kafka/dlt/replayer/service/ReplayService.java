package com.kafka.dlt.replayer.service;

import com.kafka.dlt.replayer.dto.ReplayRequest;
import com.kafka.dlt.replayer.entity.DltMessage;
import com.kafka.dlt.replayer.entity.ReplayHistory;
import com.kafka.dlt.replayer.repository.DltMessageRepository;
import com.kafka.dlt.replayer.repository.ReplayHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReplayService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final DltMessageRepository messageRepository;
    private final ReplayHistoryRepository historyRepository;
    private final DltMessageService dltMessageService;

    @Transactional
    public void replayMessages(ReplayRequest request) {
        String replayedBy = "system"; // Could be replaced with authenticated user

        for (String messageId : request.getMessageIds()) {
            try {
                DltMessage message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new RuntimeException("Message not found: " + messageId));

                // Build Kafka message with headers
                MessageBuilder<Object> builder = MessageBuilder.withPayload(message.getPayload())
                    .setHeader(KafkaHeaders.KEY, message.getKey())
                    .setHeader(KafkaHeaders.TOPIC, getOriginalTopic(message.getTopic()));

                // Add original headers
                if (message.getHeaders() != null) {
                    message.getHeaders().forEach(builder::setHeader);
                }

                // Add any additional headers from request
                if (request.getHeaders() != null) {
                    request.getHeaders().forEach(builder::setHeader);
                }

                // Add replay metadata
                builder.setHeader("X-Replay-From-DLT", "true");
                builder.setHeader("X-Original-DLT-Message-Id", messageId);

                Message<Object> kafkaMessage = builder.build();

                // Send to original topic
                kafkaTemplate.send(kafkaMessage);

                // Update message replay count
                dltMessageService.incrementReplayCount(messageId);

                // Record successful replay
                saveReplayHistory(messageId, ReplayHistory.ReplayStatus.SUCCESS, replayedBy, null);

                log.info("Successfully replayed message {} to topic {}", messageId, getOriginalTopic(message.getTopic()));

            } catch (Exception e) {
                log.error("Failed to replay message {}: {}", messageId, e.getMessage(), e);

                // Record failed replay
                saveReplayHistory(messageId, ReplayHistory.ReplayStatus.FAILED, replayedBy, e.getMessage());
            }
        }
    }

    public List<ReplayHistory> getReplayHistory(String messageId) {
        return historyRepository.findByMessageIdOrderByReplayedAtDesc(messageId);
    }

    private void saveReplayHistory(String messageId, ReplayHistory.ReplayStatus status,
                                   String replayedBy, String errorMessage) {
        ReplayHistory history = ReplayHistory.builder()
            .messageId(messageId)
            .status(status)
            .replayedBy(replayedBy)
            .errorMessage(errorMessage)
            .build();

        historyRepository.save(history);
    }

    /**
     * Converts DLT topic name to original topic name
     * Example: payment.created.dlt -> payment.created
     */
    private String getOriginalTopic(String dltTopic) {
        if (dltTopic.endsWith(".dlt")) {
            return dltTopic.substring(0, dltTopic.length() - 4);
        }
        return dltTopic;
    }
}
