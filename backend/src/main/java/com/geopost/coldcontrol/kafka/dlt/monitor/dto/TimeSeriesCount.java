package com.geopost.coldcontrol.kafka.dlt.monitor.dto;

import lombok.Builder;

@Builder
public record TimeSeriesCount(String date, long count) {

}
