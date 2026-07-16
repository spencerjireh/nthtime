package com.spencerjireh.nthtime.controller;

import java.util.Map;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Liveness + shallow readiness probe. Keeps the historical {@code {status, timestamp}} shape (the
 * Docker healthcheck only looks for a 200) but now also reflects database health, so an app that
 * has lost its DB reports unhealthy (503) rather than a misleading "ok".
 *
 * <p>The DB status is read from Actuator's managed {@code db} health indicator via {@link
 * HealthEndpoint} rather than a raw {@code DataSource.getConnection()} -- the latter can block for
 * the pool's full connection timeout when the database is down, hanging the probe. Full dependency
 * detail lives at {@code /actuator/health}.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

  private final HealthEndpoint healthEndpoint;

  public HealthController(HealthEndpoint healthEndpoint) {
    this.healthEndpoint = healthEndpoint;
  }

  @GetMapping
  public ResponseEntity<Map<String, Object>> health() {
    boolean dbUp = Status.UP.equals(databaseStatus());
    Map<String, Object> body =
        Map.of(
            "status", dbUp ? "ok" : "error",
            "db", dbUp ? "up" : "down",
            "timestamp", System.currentTimeMillis());
    return dbUp
        ? ResponseEntity.ok(body)
        : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
  }

  private Status databaseStatus() {
    try {
      HealthComponent db = healthEndpoint.healthForPath("db");
      return db != null ? db.getStatus() : Status.UNKNOWN;
    } catch (RuntimeException e) {
      return Status.DOWN;
    }
  }
}
