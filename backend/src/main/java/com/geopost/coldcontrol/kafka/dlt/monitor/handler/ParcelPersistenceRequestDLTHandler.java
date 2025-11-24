package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.persistence.parcel.ParcelPersistenceRequest;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class ParcelPersistenceRequestDLTHandler extends AbstractDLTRecordHandler<ParcelPersistenceRequest> {

    public ParcelPersistenceRequestDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "persistence-service";
    }


    @Override
    public Class<ParcelPersistenceRequest> getRecordType() {
        return ParcelPersistenceRequest.class;
    }
}
