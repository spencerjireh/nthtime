package com.spencerjireh.nthtime.controller;

import static com.spencerjireh.nthtime.util.SessionUtils.requireUserId;

import com.spencerjireh.nthtime.dto.request.UpdateSettingsRequest;
import com.spencerjireh.nthtime.dto.response.SettingsResponse;
import com.spencerjireh.nthtime.service.SettingsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

  private final SettingsService settingsService;

  public SettingsController(SettingsService settingsService) {
    this.settingsService = settingsService;
  }

  @GetMapping
  public SettingsResponse getSettings(HttpServletRequest request) {
    Long userId = requireUserId(request);
    return settingsService.getSettings(userId);
  }

  @PatchMapping
  public SettingsResponse updateSettings(
      @RequestBody UpdateSettingsRequest input, HttpServletRequest request) {
    Long userId = requireUserId(request);
    return settingsService.updateSettings(userId, input);
  }
}
