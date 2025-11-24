package com.geopost.coldcontrol.kafka.dlt.monitor.controller;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.MetricsOverviewDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MetricsController {

    private final MessageService messageService;

    @GetMapping("/metrics")
    public ResponseEntity<MetricsOverviewDTO> getMetrics() {
        return ResponseEntity.ok(messageService.getMetricsOverview());
    }

}
