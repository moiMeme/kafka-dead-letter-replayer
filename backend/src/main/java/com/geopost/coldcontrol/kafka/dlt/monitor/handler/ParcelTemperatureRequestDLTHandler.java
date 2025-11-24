package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.temperature.parcel.ParcelTemperatureRequest;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class ParcelTemperatureRequestDLTHandler extends AbstractDLTRecordHandler<ParcelTemperatureRequest> {

    public ParcelTemperatureRequestDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "service-temperature-aggregator";
    }

    @Override
    public Class<ParcelTemperatureRequest> getRecordType() {
        return ParcelTemperatureRequest.class;
    }
}
