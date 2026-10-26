package com.klef.soa.exam.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.klef.soa.exam.entity.WeatherStation;
import com.klef.soa.exam.service.DuplicateStationCodeException;
import com.klef.soa.exam.service.WeatherStationService;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080"})
public class WeatherStationController {
    private final WeatherStationService service;

    public WeatherStationController(WeatherStationService service) {
        this.service = service;
    }

    @GetMapping
    public List<WeatherStation> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public WeatherStation findById(@PathVariable Long id) {
        return service.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station not found."));
    }

    @PostMapping
    public ResponseEntity<WeatherStation> create(@Valid @RequestBody WeatherStation station) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(station));
        } catch (DuplicateStationCodeException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage(), exception);
        }
    }

    @PutMapping("/{id}")
    public WeatherStation update(@PathVariable Long id, @Valid @RequestBody WeatherStation station) {
        try {
            return service.update(id, station)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Station not found."));
        } catch (DuplicateStationCodeException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage(), exception);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!service.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
