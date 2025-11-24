package com.geopost.coldcontrol.kafka.dlt.monitor.resolver;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.BooleanNode;
import com.fasterxml.jackson.databind.node.DoubleNode;
import com.fasterxml.jackson.databind.node.FloatNode;
import com.fasterxml.jackson.databind.node.IntNode;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.experimental.UtilityClass;
import org.apache.avro.Schema;

import java.time.Instant;
import java.time.LocalDate;

@UtilityClass
public class AvroJsonNormalizer {

    private static final ObjectMapper M = new ObjectMapper();

    public static String normalizeJson(String json, Schema rootSchema) throws JsonProcessingException {
        JsonNode in = M.readTree(json);
        JsonNode out = normalize(in, rootSchema);
        return M.writeValueAsString(out);
    }

    private static JsonNode normalize(JsonNode node, Schema schema) {
        return switch (schema.getType()) {
            case RECORD -> normalizeRecord(node, schema);
            case UNION  -> normalizeUnion(node, schema);
            case ARRAY  -> normalizeArray(node, schema);
            case MAP    -> normalizeMap(node, schema);
            default     -> convertPrimitiveOrLogical(node, schema);
        };
    }

    // RECORD
    private static JsonNode normalizeRecord(JsonNode node, Schema recordSchema) {
        ObjectNode out = M.createObjectNode();
        for (Schema.Field f : recordSchema.getFields()) {
            JsonNode v = node.get(f.name());
            if (v == null || v.isNull()) {
                out.set(f.name(), NullNode.getInstance());
            } else {
                out.set(f.name(), normalize(v, f.schema()));
            }
        }
        return out;
    }

    // UNION (handles null, primitives, enum, record, array, map)
    private static JsonNode normalizeUnion(JsonNode node, Schema union) {
        // If explicitly null and union allows null → {"null": null}
        if (node.isNull() && union.getTypes().stream().anyMatch(s -> s.getType() == Schema.Type.NULL)) {
            ObjectNode wrap = M.createObjectNode();
            wrap.set("null", NullNode.getInstance());
            return wrap;
        }

        // Try each non-null branch in order and pick the first that fits
        for (Schema branch : union.getTypes()) {
            if (branch.getType() == Schema.Type.NULL) continue;

            // Array union: node must be array
            if (branch.getType() == Schema.Type.ARRAY && node.isArray()) {
                ArrayNode arr = (ArrayNode) normalizeArray(node, branch);
                ObjectNode wrap = M.createObjectNode();
                wrap.set("array", arr);
                return wrap;
            }

            // Map union: node must be object
            if (branch.getType() == Schema.Type.MAP && node.isObject()) {
                ObjectNode map = (ObjectNode) normalizeMap(node, branch);
                ObjectNode wrap = M.createObjectNode();
                wrap.set("map", map);
                return wrap;
            }

            // Record union: node must be object
            if (branch.getType() == Schema.Type.RECORD && node.isObject()) {
                ObjectNode rec = (ObjectNode) normalizeRecord(node, branch);
                ObjectNode wrap = M.createObjectNode();
                wrap.set(branch.getFullName(), rec); // fully qualified name
                return wrap;
            }

            // Enum union: node must be textual and symbol must exist
            if (branch.getType() == Schema.Type.ENUM && node.isTextual()) {
                if (branch.getEnumSymbols().contains(node.asText())) {
                    ObjectNode wrap = M.createObjectNode();
                    // Union key must be the ENUM's full name, value is the symbol string
                    wrap.put(branch.getFullName(), node.asText());
                    return wrap;
                }
            }

            // Primitive (and logical) branch
            JsonNode converted = tryConvertPrimitiveOrLogical(node, branch);
            if (converted != null) {
                ObjectNode wrap = M.createObjectNode();
                wrap.set(keyForPrimitive(branch), converted);
                return wrap;
            }
        }

        // Fallback: return as-is (lets Avro throw with a precise path if still mismatched)
        return node;
    }

    private static String keyForPrimitive(Schema s) {
        // For primitives, Avro JSON union key is the primitive name
        // (int, long, float, double, boolean, string, bytes)
        return s.getType().getName();
    }

    // ARRAY
    private static JsonNode normalizeArray(JsonNode node, Schema arraySchema) {
        ArrayNode out = M.createArrayNode();
        for (JsonNode e : node) {
            out.add(normalize(e, arraySchema.getElementType()));
        }
        return out;
    }

    // MAP
    private static JsonNode normalizeMap(JsonNode node, Schema mapSchema) {
        ObjectNode out = M.createObjectNode();
        node.fields().forEachRemaining(entry ->
                out.set(entry.getKey(), normalize(entry.getValue(), mapSchema.getValueType())));
        return out;
    }

    // PRIMITIVE + logical (non-union positions)
    private static JsonNode convertPrimitiveOrLogical(JsonNode node, Schema schema) {
        JsonNode converted = tryConvertPrimitiveOrLogical(node, schema);
        return converted != null ? converted : node;
    }

    private static JsonNode tryConvertPrimitiveOrLogical(JsonNode node, Schema schema) {
        String lt = schema.getProp("logicalType");
        if (lt != null && node.isTextual()) {
            try {
                return switch (lt) {
                    case "timestamp-millis" -> new LongNode(Instant.parse(node.asText()).toEpochMilli());
                    case "date"             -> new IntNode((int) LocalDate.parse(node.asText()).toEpochDay());
                    default -> null;
                };
            } catch (Exception ignored) { /* fall through */ }
        }

        return switch (schema.getType()) {
            case STRING  -> node.isTextual() ? node : new TextNode(node.asText());
            case INT     -> node.isInt() ? node : new IntNode(node.asInt());
            case LONG    -> node.isLong() ? node : new LongNode(node.asLong());
            case FLOAT   -> node.isFloatingPointNumber() ? node : new FloatNode((float) node.asDouble());
            case DOUBLE  -> node.isFloatingPointNumber() ? node : new DoubleNode(node.asDouble());
            case BOOLEAN -> node.isBoolean() ? node : BooleanNode.valueOf(node.asBoolean());
            default      -> null;
        };
    }
}
