package com.geopost.coldcontrol.kafka.dlt.monitor.resolver;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.MessageDTO;
import com.geopost.coldcontrol.utils.Assert;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericRecord;
import org.apache.avro.io.Decoder;
import org.apache.avro.io.DecoderFactory;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.commons.lang3.StringUtils;
import org.springframework.validation.annotation.Validated;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;

@Validated
@RequiredArgsConstructor
@Slf4j
public class MessageAvroSchemaResolver {

    @NotEmpty
    private final Map<String, Context> schemas;

    public <T extends GenericRecord> T resolve(String payload, MessageDTO message) throws IOException {
        Assert.notNull(message, "message must not be null");

        String topic = message.getTopic();

        Context context = schemas.get(topic);
        if (Objects.isNull(context)) {
            log.error("no resolver context for message with id [{}]", message.getId());
            return null;
        }

        //noinspection unchecked
        return StringUtils.isBlank(payload) ? (T) resolve(message.getPayload(), context.schema(), context.objectClass())
                : (T) resolve(payload, context.schema(), context.objectClass());
    }

    private <T extends GenericRecord> T resolve(String json, Schema schema, Class<T> objectClass) throws IOException {
        Assert.notNull(json, "json must not be null");
        Assert.notNull(schema, "avro schema must not be null");
        String normalizeJson = AvroJsonNormalizer.normalizeJson(json, schema);
        return jsonToAvro(normalizeJson, schema, objectClass);
    }

    private <T extends GenericRecord> T jsonToAvro(String json, Schema schema, Class<T> objectClass) throws IOException {
        Decoder decoder = DecoderFactory.get().jsonDecoder(schema, json);
        SpecificDatumReader<T> reader = new SpecificDatumReader<>(objectClass);
        return reader.read(null, decoder);
    }

    public record Context(Class<? extends GenericRecord> objectClass, Schema schema) {
    }

}