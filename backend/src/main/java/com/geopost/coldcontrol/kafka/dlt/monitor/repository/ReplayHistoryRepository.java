package com.geopost.coldcontrol.kafka.dlt.monitor.repository;

import com.geopost.coldcontrol.kafka.dlt.monitor.entity.ReplayHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReplayHistoryRepository extends JpaRepository<ReplayHistory, String> {
    List<ReplayHistory> findByMessageIdOrderByReplayedAtDesc(String messageId);
}
