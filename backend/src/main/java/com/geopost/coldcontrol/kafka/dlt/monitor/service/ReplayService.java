package com.geopost.coldcontrol.kafka.dlt.monitor.service;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ReplayRequest;
import com.geopost.coldcontrol.kafka.dlt.monitor.entity.ReplayHistory;

import java.io.IOException;
import java.util.List;

public interface ReplayService {

    void replayMessages(List<ReplayRequest> requests) throws IOException;

    List<ReplayHistory> getReplayHistory(String messageId);
}
