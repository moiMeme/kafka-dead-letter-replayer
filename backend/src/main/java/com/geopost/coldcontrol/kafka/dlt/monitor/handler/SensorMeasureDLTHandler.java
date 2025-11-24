package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.sensor.SensorMeasure;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class SensorMeasureDLTHandler extends AbstractDLTRecordHandler<SensorMeasure> {

    public SensorMeasureDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "temperature-service";
    }

    @Override
    public Class<SensorMeasure> getRecordType() {
        return SensorMeasure.class;
    }
}
