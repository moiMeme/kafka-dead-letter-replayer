package com.geopost.coldcontrol.kafka.dlt.monitor.service;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ServiceDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.TopicDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RequiredArgsConstructor
public class DefaultServiceStoreService implements ServiceStoreService {

    private final Map<String, List<String>> store;

    @Override
    @Cacheable(value = "services", key = "'all'")
    public List<ServiceDTO> findServices() {
        return store.entrySet()
                .stream()
                .map(entry -> ServiceDTO.builder()
                        .id(entry.getKey())
                        .name(entry.getKey())
                        .topics(entry.getValue().stream().map(topicName -> TopicDTO.builder()
                                .name(topicName)
                                .build()).toList())
                        .build())
                .toList();
    }

    @Override
    @Cacheable(value = "services", key = "#serviceId")
    public List<TopicDTO> findTopics(String serviceId) {
        List<String> topics = store.get(serviceId);
        if (Objects.isNull(topics)) {
            return store.values().stream()
                    .flatMap(List::stream)
                    .map(topicName -> TopicDTO.builder()
                            .name(topicName)
                            .build())
                    .toList();
        }
        return topics
                .stream()
                .map(topicName -> TopicDTO.builder()
                        .name(topicName)
                        .build())
                .toList();
    }

    @Override
    @Cacheable(value = "servicesByTopic", key = "#topicId")
    public ServiceDTO getServiceByTopic(String topicId) {
        for (Map.Entry<String, List<String>> entry : store.entrySet()) {
            if (entry.getValue().contains(topicId)) {
                return ServiceDTO.builder()
                        .id(entry.getKey())
                        .name(entry.getKey())
                        .build();
            }
        }
        throw new IllegalArgumentException("Topic not found in any service: " + topicId);
    }
}
