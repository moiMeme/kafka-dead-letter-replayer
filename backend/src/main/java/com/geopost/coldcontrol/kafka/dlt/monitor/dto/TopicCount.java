package com.geopost.coldcontrol.kafka.dlt.monitor.dto;

public interface TopicCount {
    String getTopic();
    long getCount();
}
