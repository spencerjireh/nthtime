package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.config.AdminSecretVerifier;
import com.spencerjireh.nthtime.dto.request.SeedPackRequest;
import com.spencerjireh.nthtime.dto.request.SeedTrackRequest;
import com.spencerjireh.nthtime.dto.request.SyncPacksRequest;
import com.spencerjireh.nthtime.service.AdminService;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final AdminService adminService;
  private final AdminSecretVerifier adminSecretVerifier;

  public AdminController(AdminService adminService, AdminSecretVerifier adminSecretVerifier) {
    this.adminService = adminService;
    this.adminSecretVerifier = adminSecretVerifier;
  }

  @PostMapping("/seed")
  public Map<String, Boolean> seedPack(
      @RequestHeader(value = "X-Admin-Secret", required = false) String adminSecret,
      @RequestBody SeedPackRequest input) {
    adminSecretVerifier.verify(adminSecret);
    adminService.seedPack(input);
    return Map.of("ok", true);
  }

  @PostMapping("/sync")
  public Map<String, Boolean> syncPacks(
      @RequestHeader(value = "X-Admin-Secret", required = false) String adminSecret,
      @RequestBody SyncPacksRequest input) {
    adminSecretVerifier.verify(adminSecret);
    adminService.syncPacks(input.packs(), input.tracks());
    return Map.of("ok", true);
  }

  @PostMapping("/seed-track")
  public Map<String, Boolean> seedTrack(
      @RequestHeader(value = "X-Admin-Secret", required = false) String adminSecret,
      @RequestBody SeedTrackRequest input) {
    adminSecretVerifier.verify(adminSecret);
    adminService.seedTrack(input);
    return Map.of("ok", true);
  }
}
