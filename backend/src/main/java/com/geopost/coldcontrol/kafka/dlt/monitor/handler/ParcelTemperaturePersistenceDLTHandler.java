package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.persistence.temperature.ParcelTemperaturePersistence;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class ParcelTemperaturePersistenceDLTHandler extends AbstractDLTRecordHandler<ParcelTemperaturePersistence> {

    public ParcelTemperaturePersistenceDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "persistence-service";
    }

    @Override
    public Class<ParcelTemperaturePersistence> getRecordType() {
        return ParcelTemperaturePersistence.class;
    }
}
