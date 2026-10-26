package com.klef.soa.exam.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.klef.soa.exam.entity.WeatherStation;
import com.klef.soa.exam.repository.WeatherStationRepository;

@Service
@Transactional
public class WeatherStationService {
    private final WeatherStationRepository repository;

    public WeatherStationService(WeatherStationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<WeatherStation> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<WeatherStation> findById(Long id) {
        return repository.findById(id);
    }

    public WeatherStation create(WeatherStation station) {
        if (repository.existsByStationCode(station.getStationCode().trim())) {
            throw new DuplicateStationCodeException(station.getStationCode());
        }
        station.setId(null);
        station.setStationCode(station.getStationCode().trim());
        station.setLocation(station.getLocation().trim());
        return repository.save(station);
    }

    public Optional<WeatherStation> update(Long id, WeatherStation changes) {
        if (repository.existsByStationCodeAndIdNot(changes.getStationCode().trim(), id)) {
            throw new DuplicateStationCodeException(changes.getStationCode());
        }
        return repository.findById(id).map(station -> {
            station.setStationCode(changes.getStationCode().trim());
            station.setLocation(changes.getLocation().trim());
            station.setSensorCount(changes.getSensorCount());
            station.setActive(changes.isActive());
            return repository.save(station);
        });
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
