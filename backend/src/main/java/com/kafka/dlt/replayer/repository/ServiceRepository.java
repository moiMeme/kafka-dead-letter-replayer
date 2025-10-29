package com.kafka.dlt.replayer.repository;

import com.kafka.dlt.replayer.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, String> {
}
