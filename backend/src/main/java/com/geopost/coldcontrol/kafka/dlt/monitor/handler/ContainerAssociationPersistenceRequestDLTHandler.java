package com.geopost.coldcontrol.kafka.dlt.monitor.handler;

import com.geopost.coldcontrol.common.kafka.avro.persistence.association.ContainerAssociationPersistenceRequest;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import org.springframework.stereotype.Service;

@Service
public class ContainerAssociationPersistenceRequestDLTHandler extends AbstractDLTRecordHandler<ContainerAssociationPersistenceRequest> {

    public ContainerAssociationPersistenceRequestDLTHandler(MessageService messageService) {
        super(messageService);
    }

    @Override
    protected String getServiceId() {
        return "persistence-service";
    }

    @Override
    public Class<ContainerAssociationPersistenceRequest> getRecordType() {
        return ContainerAssociationPersistenceRequest.class;
    }
}
