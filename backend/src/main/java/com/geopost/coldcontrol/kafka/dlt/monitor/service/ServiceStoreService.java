package com.geopost.coldcontrol.kafka.dlt.monitor.service;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ServiceDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.TopicDTO;

import java.util.List;

public interface ServiceStoreService {

    List<ServiceDTO> findServices();
    List<TopicDTO> findTopics(String serviceId);

    ServiceDTO getServiceByTopic(String topicId);

}
