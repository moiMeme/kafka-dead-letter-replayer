package com.kafka.dlt.replayer.repository;

import com.kafka.dlt.replayer.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByServiceId(String serviceId);
}
