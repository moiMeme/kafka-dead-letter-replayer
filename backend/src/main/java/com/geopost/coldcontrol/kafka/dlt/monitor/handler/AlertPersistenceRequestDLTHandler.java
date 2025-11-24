package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.persistence.alert.AlertPersistenceRequest;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class AlertPersistenceRequestDLTHandler extends AbstractDLTRecordHandler<AlertPersistenceRequest> {

    public AlertPersistenceRequestDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "persistence-service";
    }

    @Override
    public Class<AlertPersistenceRequest> getRecordType() {
        return AlertPersistenceRequest.class;
    }
}
