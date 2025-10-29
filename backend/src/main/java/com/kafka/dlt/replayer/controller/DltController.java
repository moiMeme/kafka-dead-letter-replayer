package com.kafka.dlt.replayer.controller;

import com.kafka.dlt.replayer.dto.MessageDTO;
import com.kafka.dlt.replayer.dto.MetricsOverviewDTO;
import com.kafka.dlt.replayer.dto.ReplayRequest;
import com.kafka.dlt.replayer.entity.ReplayHistory;
import com.kafka.dlt.replayer.entity.Service;
import com.kafka.dlt.replayer.entity.Topic;
import com.kafka.dlt.replayer.repository.ServiceRepository;
import com.kafka.dlt.replayer.repository.TopicRepository;
import com.kafka.dlt.replayer.service.DltMessageService;
import com.kafka.dlt.replayer.service.ReplayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DltController {

    private final ServiceRepository serviceRepository;
    private final TopicRepository topicRepository;
    private final DltMessageService messageService;
    private final ReplayService replayService;

    @GetMapping("/services")
    public ResponseEntity<List<Service>> getServices() {
        return ResponseEntity.ok(serviceRepository.findAll());
    }

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getTopics(@RequestParam(required = false) String serviceId) {
        if (serviceId != null && !serviceId.isEmpty()) {
            return ResponseEntity.ok(topicRepository.findByServiceId(serviceId));
        }
        return ResponseEntity.ok(topicRepository.findAll());
    }

    @GetMapping("/errorTypes")
    public ResponseEntity<List<ErrorTypeDTO>> getErrorTypes() {
        // Standard Kafka error types
        List<ErrorTypeDTO> errorTypes = Arrays.asList(
            new ErrorTypeDTO(1, "DeserializationException"),
            new ErrorTypeDTO(2, "ValidationException"),
            new ErrorTypeDTO(3, "TimeoutException"),
            new ErrorTypeDTO(4, "ServiceUnavailableException"),
            new ErrorTypeDTO(5, "UnknownException")
        );
        return ResponseEntity.ok(errorTypes);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<MessageDTO>> getMessages(@RequestParam Map<String, String> filters) {
        // Remove pagination params if present (handled by frontend)
        filters.remove("_page");
        filters.remove("_limit");
        filters.remove("_sort");
        filters.remove("_order");

        return ResponseEntity.ok(messageService.findMessages(filters));
    }

    @GetMapping("/messages/{id}")
    public ResponseEntity<MessageDTO> getMessage(@PathVariable String id) {
        MessageDTO message = messageService.findById(id);
        if (message == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(message);
    }

    @PostMapping("/replays")
    public ResponseEntity<Void> replayMessages(@RequestBody ReplayRequest request) {
        replayService.replayMessages(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/replays")
    public ResponseEntity<List<ReplayHistory>> getReplayHistory(@RequestParam String messageId) {
        return ResponseEntity.ok(replayService.getReplayHistory(messageId));
    }

    @GetMapping("/metrics")
    public ResponseEntity<MetricsOverviewDTO> getMetrics() {
        return ResponseEntity.ok(messageService.getMetricsOverview());
    }

    // DTO for error types
    public record ErrorTypeDTO(int id, String name) {}
}
