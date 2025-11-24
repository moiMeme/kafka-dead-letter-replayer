package com.geopost.coldcontrol.kafka.dlt.monitor.controller;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ServiceDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.TopicDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.ServiceStoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceStoreService serviceStoreService;

    @GetMapping("/services")
    public ResponseEntity<List<ServiceDTO>> getServices() {
        List<ServiceDTO> services = serviceStoreService.findServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicDTO>> getTopics(@RequestParam(required = false) String serviceId) {
        List<TopicDTO> topics = serviceStoreService.findTopics(serviceId);
        return ResponseEntity.ok(topics);
    }

}
