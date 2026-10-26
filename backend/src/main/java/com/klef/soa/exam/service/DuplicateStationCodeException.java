package com.klef.soa.exam.service;

public class DuplicateStationCodeException extends RuntimeException {
    public DuplicateStationCodeException(String stationCode) {
        super("A station with code '" + stationCode + "' already exists.");
    }
}
