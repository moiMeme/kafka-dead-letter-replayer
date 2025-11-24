package com.geopost.coldcontrol.kafka.dlt.monitor.controller;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ReplayRequest;
import com.geopost.coldcontrol.kafka.dlt.monitor.entity.ReplayHistory;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.ReplayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReplayHistoryController {

    private final ReplayService replayService;

    @PostMapping("/replays")
    public ResponseEntity<Void> replayMessages(@RequestBody List<ReplayRequest> requests) throws IOException {
        replayService.replayMessages(requests);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/replays")
    public ResponseEntity<List<ReplayHistory>> getReplayHistory(@RequestParam String messageId) {
        return ResponseEntity.ok(replayService.getReplayHistory(messageId));
    }

}
