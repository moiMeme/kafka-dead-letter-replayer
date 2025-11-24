package com.geopost.coldcontrol.kafka.dlt.monitor.service;

import com.geopost.coldcontrol.common.kafka.constants.KafkaHeader;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.MessageDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ReplayRequest;
import com.geopost.coldcontrol.kafka.dlt.monitor.entity.ReplayHistory;
import com.geopost.coldcontrol.kafka.dlt.monitor.repository.ReplayHistoryRepository;
import com.geopost.coldcontrol.kafka.dlt.monitor.resolver.MessageAvroSchemaResolver;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class DefaultReplayService implements ReplayService {

    private final KafkaTemplate<String, GenericRecord> kafkaTemplate;
    private final ReplayHistoryRepository historyRepository;
    private final MessageService messageService;
    private final MessageAvroSchemaResolver messageAvroSchemaResolver;

    @Transactional
    @Override
    public void replayMessages(List<ReplayRequest> requests) throws IOException {

        Map<String, List<ProducerRecord<String, GenericRecord>>> records = new HashMap<>();
        for (ReplayRequest request : requests) {
            MessageDTO message = messageService.findMessageById(request.messageIds())
                    .orElseThrow(() -> new RuntimeException("Message not found: " + request.messageIds()));

            GenericRecord record = messageAvroSchemaResolver.resolve(request.payload(), message);
            Headers headers = resolveHeaders(message, request);

            ProducerRecord<String, GenericRecord> producerRecord = new ProducerRecord<>(
                    message.getTopic(),
                    null,
                    message.getKey(),
                    record,
                    headers
            );

            records.computeIfAbsent(message.getTopic(), ignored -> new ArrayList<>()).add(producerRecord);
        }

        records.entrySet()
                .stream()
                .flatMap(entry -> sendMessages(entry.getValue(), entry.getKey()).stream())
                .forEach(kafkaSendResult -> {
                    if (kafkaSendResult instanceof KafkaSendResult.Success success) {
                        saveReplayHistory(success.id(), ReplayHistory.ReplayStatus.SUCCESS, null);
                        log.info("Successfully replayed message {} to topic {}", success.id(), success.topic());
                        messageService.incrementReplayCount(success.id());
                    } else {
                        if (kafkaSendResult instanceof KafkaSendResult.Failure failure) {
                            log.error("Failed to replay message {}: {}", failure.id(), failure.cause().getMessage(), failure.cause());
                            saveReplayHistory(failure.id(), ReplayHistory.ReplayStatus.FAILED, failure.cause().getMessage());
                        }
                    }
                });

    }

    @Override
    public List<ReplayHistory> getReplayHistory(String messageId) {
        return historyRepository.findByMessageIdOrderByReplayedAtDesc(messageId);
    }

    private void saveReplayHistory(String messageId, ReplayHistory.ReplayStatus status, String errorMessage) {
        ReplayHistory history = ReplayHistory.builder()
                .messageId(messageId)
                .status(status)
                .errorMessage(errorMessage)
                .build();

        historyRepository.save(history);
    }

    private Headers resolveHeaders(MessageDTO message, ReplayRequest request) {
        Map<String, String> headers = request.headers();
        Headers messageHeaders = new RecordHeaders();
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            if (entry.getKey().startsWith("kafka_dlt")) {
                continue;
            }
            messageHeaders.add(entry.getKey(), entry.getValue().getBytes());
        }

        messageHeaders.add(KafkaHeader.KAFKA_DLT_MESSAGE_ID.get(request.messageIds()));
        messageHeaders.add(KafkaHeader.KAFKA_DLT_MESSAGE_REPLAY_COUNT.get(String.valueOf(message.getReplayCount())));
        messageHeaders.add(KafkaHeader.KAFKA_DLT_MESSAGE_REPLAY_TIMESTAMP.get(String.valueOf(message.getLastReplayAt())));

        return messageHeaders;
    }

    private List<KafkaSendResult> sendMessages(List<ProducerRecord<String, GenericRecord>> records, String topic) {
        log.info("Sending {} messages to Kafka topic: {}", records.size(), topic);
        List<CompletableFuture<KafkaSendResult>> futures = new ArrayList<>(records.size());
        for (ProducerRecord<String, GenericRecord> record : records) {
            futures.add(sendMessage(KafkaHeader.KAFKA_DLT_MESSAGE_ID.retrieveValue(record.headers(), ""), record));
        }

        return futures.stream()
                .map(CompletableFuture::join)
                .toList();
    }


    /**
     * Sends a single message asynchronously
     */
    private CompletableFuture<KafkaSendResult> sendMessage(String id, ProducerRecord<String, GenericRecord> record) {
        try {

            CompletableFuture<SendResult<String, GenericRecord>> kafkaFuture = kafkaTemplate.send(record);

            return kafkaFuture
                    .<KafkaSendResult>thenApply(result -> {
                        log.debug("Message {} sent successfully to partition {} with offset {}",
                                id,
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());

                        return new KafkaSendResult.Success(
                                id,
                                record.topic()
                        );
                    })
                    .exceptionally(ex -> {
                        log.error("Failed to send message {} to Kafka", record.key(), ex);

                        return new KafkaSendResult.Failure(
                                id,
                                record.topic(),
                                ex
                        );
                    });

        } catch (Exception e) {

            log.error("Error creating producer record for message {}", record.key(), e);

            return CompletableFuture.completedFuture(
                    new KafkaSendResult.Failure(
                            id,
                            record.topic(),
                            e
                    )
            );
        }

    }

    public sealed interface KafkaSendResult permits KafkaSendResult.Success, KafkaSendResult.Failure {

        String id();

        String topic();

        record Success(
                String id,
                String topic
        ) implements KafkaSendResult {
        }

        record Failure(
                String id,
                String topic,
                Throwable cause
        ) implements KafkaSendResult {
        }
    }

}
