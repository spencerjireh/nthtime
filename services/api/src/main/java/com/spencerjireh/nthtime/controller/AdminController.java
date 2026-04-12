package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.dto.request.SeedPackRequest;
import com.spencerjireh.nthtime.dto.request.SeedTrackRequest;
import com.spencerjireh.nthtime.dto.request.SyncPacksRequest;
import com.spencerjireh.nthtime.dto.request.SyncTracksRequest;
import com.spencerjireh.nthtime.exception.ForbiddenException;
import com.spencerjireh.nthtime.service.AdminService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final AdminService adminService;
  private final String adminSecret;

  public AdminController(
      AdminService adminService, @Value("${nthtime.admin-secret}") String adminSecret) {
    this.adminService = adminService;
    this.adminSecret = adminSecret;
  }

  @PostMapping("/seed")
  public Map<String, Boolean> seedPack(@RequestBody SeedPackRequest input) {
    verifyAdminSecret(input.adminSecret());
    adminService.seedPack(input);
    return Map.of("ok", true);
  }

  @PostMapping("/sync")
  public Map<String, Boolean> syncPacks(@RequestBody SyncPacksRequest input) {
    verifyAdminSecret(input.adminSecret());
    adminService.syncPacks(input.packs());
    return Map.of("ok", true);
  }

  @PostMapping("/seed-track")
  public Map<String, Boolean> seedTrack(@RequestBody SeedTrackRequest input) {
    verifyAdminSecret(input.adminSecret());
    adminService.seedTrack(input);
    return Map.of("ok", true);
  }

  @PostMapping("/sync-tracks")
  public Map<String, Boolean> syncTracks(@RequestBody SyncTracksRequest input) {
    verifyAdminSecret(input.adminSecret());
    adminService.syncTracks(input.tracks());
    return Map.of("ok", true);
  }

  private void verifyAdminSecret(String secret) {
    if (secret == null
        || !MessageDigest.isEqual(
            secret.getBytes(StandardCharsets.UTF_8),
            adminSecret.getBytes(StandardCharsets.UTF_8))) {
      throw new ForbiddenException("Invalid admin secret");
    }
  }
}
