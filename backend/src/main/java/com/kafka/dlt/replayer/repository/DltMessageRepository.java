package com.kafka.dlt.replayer.repository;

import com.kafka.dlt.replayer.entity.DltMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DltMessageRepository extends JpaRepository<DltMessage, String>, JpaSpecificationExecutor<DltMessage> {

    List<DltMessage> findByServiceId(String serviceId);

    List<DltMessage> findByTopic(String topic);

    List<DltMessage> findByErrorType(String errorType);

    List<DltMessage> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(m) FROM DltMessage m WHERE m.timestamp >= :since")
    Long countMessagesSince(LocalDateTime since);

    @Query("SELECT m.errorType as errorType, COUNT(m) as count FROM DltMessage m GROUP BY m.errorType")
    List<ErrorTypeCount> countByErrorType();

    @Query("SELECT m.topic as topic, COUNT(m) as count FROM DltMessage m GROUP BY m.topic ORDER BY count DESC")
    List<TopicCount> countByTopic();

    interface ErrorTypeCount {
        String getErrorType();
        Long getCount();
    }

    interface TopicCount {
        String getTopic();
        Long getCount();
    }
}
