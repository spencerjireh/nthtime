package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.dto.request.UpdateSettingsRequest;
import com.spencerjireh.nthtime.dto.response.SettingsResponse;
import com.spencerjireh.nthtime.exception.ForbiddenException;
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

  private Long getUserId(HttpServletRequest request) {
    if (request.getSession(false) == null) return null;
    Object attr = request.getSession().getAttribute("appUserId");
    return attr instanceof Long l ? l : null;
  }

  private Long requireUserId(HttpServletRequest request) {
    Long userId = getUserId(request);
    if (userId == null) throw new ForbiddenException("Not authenticated");
    return userId;
  }
}
