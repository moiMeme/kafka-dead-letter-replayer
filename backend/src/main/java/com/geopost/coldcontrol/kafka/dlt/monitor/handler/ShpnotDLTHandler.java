package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.events.Shpnot;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class ShpnotDLTHandler extends AbstractDLTRecordHandler<Shpnot>{

    public ShpnotDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "event-service";
    }

    @Override
    public Class<Shpnot> getRecordType() {
        return Shpnot.class;
    }
}
