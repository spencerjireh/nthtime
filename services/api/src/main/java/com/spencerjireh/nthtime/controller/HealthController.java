package com.spencerjireh.nthtime.controller;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness + shallow readiness probe. Keeps the historical {@code {status, timestamp}} shape (the
 * Docker healthcheck only looks for a 200) but now also probes the database, so an app that has
 * lost its DB reports unhealthy (503) rather than a misleading "ok". Full dependency detail lives
 * at {@code /actuator/health}.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

  private final DataSource dataSource;

  public HealthController(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @GetMapping
  public ResponseEntity<Map<String, Object>> health() {
    boolean dbUp = databaseReachable();
    Map<String, Object> body =
        Map.of(
            "status", dbUp ? "ok" : "error",
            "db", dbUp ? "up" : "down",
            "timestamp", System.currentTimeMillis());
    return dbUp
        ? ResponseEntity.ok(body)
        : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
  }

  private boolean databaseReachable() {
    try (Connection connection = dataSource.getConnection()) {
      return connection.isValid(2);
    } catch (SQLException e) {
      return false;
    }
  }
}
