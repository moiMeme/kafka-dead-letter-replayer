package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.events.TTEvent;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class TTEventDLTHandler extends AbstractDLTRecordHandler<TTEvent> {

    public TTEventDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "event-service";
    }

    @Override
    public Class<TTEvent> getRecordType() {
        return TTEvent.class;
    }

}
