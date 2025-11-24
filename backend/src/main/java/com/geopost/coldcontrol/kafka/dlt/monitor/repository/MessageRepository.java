package com.geopost.coldcontrol.kafka.dlt.monitor.repository;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ErrorTypeCount;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ErrorTypeDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ServiceCount;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.TopicCount;
import com.geopost.coldcontrol.kafka.dlt.monitor.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String>, JpaSpecificationExecutor<Message> {

    List<Message> findByServiceId(String serviceId);

    List<Message> findByTopic(String topic);

    List<Message> findByErrorType(String errorType);

    List<Message> findByTimestampBetween(ZonedDateTime start, ZonedDateTime end);


    @Query("SELECT COUNT(m) FROM Message m WHERE m.timestamp >= :since")
    Long countMessagesSince(ZonedDateTime since);

    @Query("SELECT m.errorType as errorType, COUNT(m) as count FROM Message m GROUP BY m.errorType")
    List<ErrorTypeCount> countByErrorType();

    @Query("SELECT distinct m.errorType as name FROM Message m")
    List<ErrorTypeDTO> findErrorType();

    @Query("SELECT m.topic as topic, COUNT(m) as count FROM Message m GROUP BY m.topic ORDER BY count DESC")
    List<TopicCount> countByTopic();

    @Query("SELECT m.serviceId as serviceId, COUNT(m) as count FROM Message m GROUP BY m.serviceId ORDER BY count DESC")
    List<ServiceCount> countByService();

    @Query("SELECT COUNT(m) as count FROM Message m WHERE m.timestamp >= :start and m.timestamp <= :end")
    long countByDay(ZonedDateTime start, ZonedDateTime end);

}
