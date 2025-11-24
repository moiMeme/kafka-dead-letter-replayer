package com.geopost.coldcontrol.kafka.dlt.monitor.configuration;

import com.geopost.coldcontrol.common.kafka.annotation.EnableKafkaConfiguration;
import com.geopost.coldcontrol.common.kafka.config.KafkaConsumerProperties;
import com.geopost.coldcontrol.kafka.dlt.monitor.resolver.MessageAvroSchemaResolver;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.DefaultServiceStoreService;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.ServiceStoreService;
import lombok.extern.slf4j.Slf4j;
import org.apache.avro.Schema;
import org.apache.avro.reflect.ReflectData;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Configuration
@EnableKafkaConfiguration
@EnableConfigurationProperties(KafkaDltMonitorProperties.class)
@ComponentScan(basePackages = "com.geopost.coldcontrol")
public class KafkaDltMonitorConfiguration {

    @Bean
    ServiceStoreService serviceStoreService(KafkaDltMonitorProperties properties) {
        return new DefaultServiceStoreService(properties.getStore());
    }

    @Bean
    MessageAvroSchemaResolver messageAvroSchemaResolver(KafkaConsumerProperties properties) {
        Map<String, MessageAvroSchemaResolver.Context> contextMap = new ConcurrentHashMap<>();

        for (KafkaConsumerProperties.Topic topic : properties.getTopics()) {
            Schema schema = ReflectData.get().getSchema(topic.getRecordClass());
            contextMap.put(topic.getName(), new MessageAvroSchemaResolver.Context(topic.getRecordClass(), schema));
        }

        return new MessageAvroSchemaResolver(contextMap);
    }

}
