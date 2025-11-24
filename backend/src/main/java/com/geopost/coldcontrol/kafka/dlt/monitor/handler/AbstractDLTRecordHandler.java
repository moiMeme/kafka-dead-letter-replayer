package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.constants.KafkaHeader;
import com.geopost.coldcontrol.common.kafka.core.handler.RecordHandler;
import com.geopost.coldcontrol.kafka.dlt.monitor.entity.Message;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.avro.specific.SpecificRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractDLTRecordHandler<T extends SpecificRecord> implements RecordHandler<T> {

    private final MessageService messageService;

    @Override
    public void onRecord(T record, String key, Headers headers) {

        log.info("Received DLT message from topic: {}", headers);

        String serviceId = getServiceId();

        String payload = record.toString();


        String stacktrace = KafkaHeader.KAFKA_DLT_EXCEPTION_STACKTRACE.retrieveValue(headers, "No stacktrace available");
        headers.remove(KafkaHeader.KAFKA_DLT_EXCEPTION_STACKTRACE.getValue());

        RootCause rootCause = extractRootCause(stacktrace);

        Map<String, String> headersToPersist = mapHeaders(headers);

        String topic = headersToPersist.get(KafkaHeader.KAFKA_DLT_ORIGINAL_TOPIC.getValue());
        Long timestamp = Optional.ofNullable(headersToPersist.get(KafkaHeader.KAFKA_DLT_ORIGINAL_TIMESTAMP.getValue()))
                .map(Long::parseLong)
                .orElse(null);

        String id = headersToPersist.get(KafkaHeader.KAFKA_DLT_MESSAGE_ID.getValue());

        if (Objects.isNull(id)) {
            SaveRequest.create(messageService)
                    .key(key)
                    .topic(topic)
                    .timestamp(timestamp)
                    .serviceId(serviceId)
                    .payload(payload)
                    .rootCause(rootCause)
                    .headers(headersToPersist)
                    .save();

        } else {
            messageService.findMessageById(id)
                    .ifPresentOrElse(message -> UpdateRequest.create(messageService)
                                    .id(message.getId())
                                    .key(message.getKey())
                                    .topic(message.getTopic())
                                    .timestamp(timestamp)
                                    .replayCount(message.getReplayCount())
                                    .replayAt(message.getLastReplayAt())
                                    .serviceId(message.getServiceId())
                                    .payload(payload)
                                    .rootCause(rootCause)
                                    .headers(headersToPersist)
                                    .update(),
                            () -> {
                                int replayCount = Optional.ofNullable(headersToPersist.get(KafkaHeader.KAFKA_DLT_MESSAGE_REPLAY_COUNT.getValue()))
                                        .map(Integer::parseInt)
                                        .orElse(0);

                                Long replayAtTimestamp = Optional.ofNullable(headersToPersist.get(KafkaHeader.KAFKA_DLT_MESSAGE_REPLAY_TIMESTAMP.getValue()))
                                        .map(Long::parseLong)
                                        .orElse(null);
                                UpdateRequest.create(messageService).id(id)
                                        .key(key)
                                        .topic(topic)
                                        .timestamp(timestamp)
                                        .replayCount(replayCount)
                                        .replayAt(replayAtTimestamp)
                                        .serviceId(serviceId)
                                        .payload(payload)
                                        .rootCause(rootCause)
                                        .headers(headersToPersist)
                                        .update();
                            }
                    );
        }

    }

    record RootCause(String stacktrace, String type, String message, String location, String causeTrace) {
    }

    private RootCause extractRootCause(String stackTrace) {
        if (stackTrace == null || stackTrace.isEmpty()) {
            return new RootCause("", "UNKNOWN_ERROR", "", "", "");
        }

        // Find the last "Caused by:" section (including its nested lines)
        int causedIdx = stackTrace.lastIndexOf("Caused by:");
        String causeTrace;
        String rootSection;

        if (causedIdx >= 0) {
            causeTrace = stackTrace.substring(causedIdx).trim();
            rootSection = stackTrace.substring(causedIdx + "Caused by:".length()).trim();
        } else {
            causeTrace = stackTrace.trim();
            rootSection = stackTrace.trim();
        }

        // Extract only the first line for message
        int newlineIdx = rootSection.indexOf('\n');
        if (newlineIdx > 0) {
            rootSection = rootSection.substring(0, newlineIdx).trim();
        }

        // Extract type and message text
        int colonIdx = rootSection.indexOf(':');
        String type, rest;
        if (colonIdx > 0) {
            type = rootSection.substring(0, colonIdx).trim();
            rest = rootSection.substring(colonIdx + 1).trim();
        } else {
            type = rootSection.trim();
            rest = "";
        }

        // Find first com.geopost.coldcontrol frame (method + line)
        String location;
        Pattern framePattern = Pattern.compile(
                "(com\\.geopost\\.coldcontrol[\\w.$]+\\.[\\w$]+\\([^)]*\\.java:\\d+\\))"
        );
        Matcher matcher = framePattern.matcher(causeTrace);
        if (matcher.find()) {
            location = matcher.group(1);
        } else {
            // fallback to first class in package
            int pkgIdx = stackTrace.indexOf("com.geopost.coldcontrol");
            if (pkgIdx >= 0) {
                int end = stackTrace.indexOf('\n', pkgIdx);
                if (end < 0) end = stackTrace.length();
                location = stackTrace.substring(pkgIdx, end).trim();
            } else {
                location = "";
            }
        }

        // Build message (short, single line)
        String message = type + ": " + rest;

        return new RootCause(stackTrace, type, message, location, causeTrace);
    }

    public Map<String, String> mapHeaders(Headers headers) {
        Map<String, String> map = HashMap.newHashMap(headers.toArray().length);
        for (Header header : headers) {
            String key = header.key();
            byte[] value = header.value();

            if (value == null) {
                continue;
            }

            if (value.length == Long.BYTES) {
                long longVal = ByteBuffer.wrap(value).getLong();
                map.put(key, String.valueOf(longVal));
            } else if (value.length == Integer.BYTES) {
                int intVal = ByteBuffer.wrap(value).getInt();
                map.put(key, String.valueOf(intVal));
            } else {
                String text = new String(value, StandardCharsets.UTF_8);
                map.put(key, sanitize(text));
            }
        }

        return map;
    }

    private String sanitize(String input) {
        if (input == null) return null;
        // Supprimer tout caractère nul ou non UTF-8 valide
        return input.replace("\u0000", "");
    }

    private static class SaveRequest {

        private final MessageService messageService;

        private String key;
        private String topic;
        private ZonedDateTime timestamp;
        private String serviceId;
        private String payload;
        private RootCause rootCause;
        private Map<String, String> headers;

        private SaveRequest(MessageService messageService) {
            this.messageService = messageService;
        }

        public static SaveRequest create(MessageService messageService) {
            return new SaveRequest(messageService);
        }


        public SaveRequest key(final String key) {
            this.key = key;
            return this;
        }

        public SaveRequest topic(final String topic) {
            this.topic = topic;
            return this;
        }

        public SaveRequest timestamp(final Long timestamp) {
            this.timestamp = timestamp != null ?
                    ZonedDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.of("UTC")) :
                    ZonedDateTime.now();
            return this;
        }

        public SaveRequest serviceId(final String serviceId) {
            this.serviceId = serviceId;
            return this;
        }

        public SaveRequest payload(final String payload) {
            this.payload = payload;
            return this;
        }

        public SaveRequest rootCause(final RootCause rootCause) {
            this.rootCause = rootCause;
            return this;
        }


        public SaveRequest headers(final Map<String, String> headers) {
            this.headers = headers;
            return this;
        }


        public void save() {

            Objects.requireNonNull(key, "message key must not be null");
            Objects.requireNonNull(topic, "topic must not be null");
            Objects.requireNonNull(timestamp, "timestamp must not be null");
            Objects.requireNonNull(serviceId, "serviceId must not be null");
            Objects.requireNonNull(payload, "payload must not be null");


            Message dltMessage = Message.builder()
                    .serviceId(serviceId)
                    .key(key)
                    .topic(topic)
                    .timestamp(timestamp)
                    .errorType(rootCause.type())
                    .errorMessage(rootCause.message())
                    .errorLocation(rootCause.location())
                    .errorCauseTrace(rootCause.causeTrace())
                    .replayCount(0)
                    .headers(headers)
                    .payload(payload)
                    .stacktrace(rootCause.stacktrace())
                    .build();

            Message persistedMessage = messageService.saveMessage(dltMessage);

            log.info("Successfully saved DLT message with ID: {}", persistedMessage.getId());
        }

    }

    private static class UpdateRequest {

        private final MessageService messageService;

        private UUID id;
        private String key;
        private String topic;
        private ZonedDateTime timestamp;
        private int replayCount;
        private ZonedDateTime replayAt;
        private String serviceId;
        private String payload;
        private RootCause rootCause;
        private Map<String, String> headers;

        private UpdateRequest(MessageService messageService) {
            this.messageService = messageService;
        }

        public static UpdateRequest create(MessageService messageService) {
            return new UpdateRequest(messageService);
        }

        public UpdateRequest id(final String id) {
            this.id = UUID.fromString(id);
            return this;
        }

        public UpdateRequest key(final String key) {
            this.key = key;
            return this;
        }

        public UpdateRequest replayCount(final int replayCount) {
            this.replayCount = replayCount;
            return this;
        }

        public UpdateRequest replayAt(final ZonedDateTime replayAt) {
            this.replayAt = replayAt;
            return this;
        }

        public UpdateRequest replayAt(final Long replayAt) {
            this.replayAt = replayAt != null ?
                    ZonedDateTime.ofInstant(Instant.ofEpochMilli(replayAt), ZoneId.of("UTC")) :
                    ZonedDateTime.now();
            return this;
        }

        public UpdateRequest topic(final String topic) {
            this.topic = topic;
            return this;
        }

        public UpdateRequest timestamp(final Long timestamp) {
            this.timestamp = timestamp != null ?
                    ZonedDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.of("UTC")) :
                    ZonedDateTime.now();
            return this;
        }

        public UpdateRequest serviceId(final String serviceId) {
            this.serviceId = serviceId;
            return this;
        }

        public UpdateRequest payload(final String payload) {
            this.payload = payload;
            return this;
        }

        public UpdateRequest rootCause(final RootCause rootCause) {
            this.rootCause = rootCause;
            return this;
        }


        public UpdateRequest headers(final Map<String, String> headers) {
            this.headers = headers;
            return this;
        }

        public void update() {

            Objects.requireNonNull(id, "message id must not be null");
            Objects.requireNonNull(key, "message key must not be null");
            Objects.requireNonNull(topic, "topic must not be null");
            Objects.requireNonNull(timestamp, "timestamp must not be null");
            Objects.requireNonNull(serviceId, "serviceId must not be null");
            Objects.requireNonNull(payload, "payload must not be null");

            Message dltMessage = Message.builder()
                    .id(id)
                    .serviceId(serviceId)
                    .key(key)
                    .topic(topic)
                    .timestamp(timestamp)
                    .errorType(rootCause.type())
                    .errorMessage(rootCause.message())
                    .errorLocation(rootCause.location())
                    .errorCauseTrace(rootCause.causeTrace())
                    .replayCount(replayCount)
                    .lastReplayAt(replayAt)
                    .headers(headers)
                    .payload(payload)
                    .stacktrace(rootCause.stacktrace())
                    .build();

            Message persistedMessage = messageService.saveMessage(dltMessage);

            log.info("Successfully saved DLT message with ID: {}", persistedMessage.getId());
        }

    }


    protected abstract String getServiceId();

}
