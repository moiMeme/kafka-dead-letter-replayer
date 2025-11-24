package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.alert.RunParcelAlerterCmd;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class RunParcelAlerterCmdDLTHandler extends AbstractDLTRecordHandler<RunParcelAlerterCmd> {

    public RunParcelAlerterCmdDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "alert-service";
    }

    @Override
    public Class<RunParcelAlerterCmd> getRecordType() {
        return RunParcelAlerterCmd.class;
    }
}
