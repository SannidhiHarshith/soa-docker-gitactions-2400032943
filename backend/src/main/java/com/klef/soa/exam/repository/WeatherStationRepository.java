package com.klef.soa.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klef.soa.exam.entity.WeatherStation;

public interface WeatherStationRepository extends JpaRepository<WeatherStation, Long> {
    boolean existsByStationCode(String stationCode);
    boolean existsByStationCodeAndIdNot(String stationCode, Long id);
}
