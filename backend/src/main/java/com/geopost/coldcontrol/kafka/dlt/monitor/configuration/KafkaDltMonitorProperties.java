package com.geopost.coldcontrol.kafka.dlt.monitor.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;
import java.util.Map;

@ConfigurationProperties(prefix = "kafka.dlt.monitor")
@Getter
@Setter
public class KafkaDltMonitorProperties {

    private Map<String, List<String>> store;

}
