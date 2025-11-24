package com.geopost.coldcontrol.kafka.dlt.monitor.service;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ErrorTypeDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.MessageDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.MetricsOverviewDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MessageService {

    List<ErrorTypeDTO> findErrorTypes();
    Page<MessageDTO> findMessages(Map<String, String> filters, Pageable pageable);
    Optional<MessageDTO> findMessageById(String messageId);
    Message saveMessage(Message message);
    void incrementReplayCount(String messageId);
    MetricsOverviewDTO getMetricsOverview();
    boolean deleteMessageByIds(List<String> ids);
}
