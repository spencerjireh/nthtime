package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.config.RateLimitConfig;
import com.spencerjireh.nthtime.dto.request.UpdateSettingsRequest;
import com.spencerjireh.nthtime.dto.response.SettingsResponse;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.UserSettings;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.UserSettingsRepository;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

  private static final Object DEFAULT_FORMATTER =
      Map.of(
          "defaults", Map.of("enabled", true, "trigger", "manual", "tabSize", 2, "useTabs", false),
          "overrides", Map.of());

  private static final SettingsResponse DEFAULT_SETTINGS =
      new SettingsResponse(
          new SettingsResponse.FeedbackConfig(true, true, true, false, false),
          "default",
          true,
          DEFAULT_FORMATTER,
          true,
          false);

  private final UserSettingsRepository userSettingsRepository;
  private final AppUserRepository appUserRepository;
  private final RateLimitConfig rateLimitConfig;

  public SettingsService(
      UserSettingsRepository userSettingsRepository,
      AppUserRepository appUserRepository,
      RateLimitConfig rateLimitConfig) {
    this.userSettingsRepository = userSettingsRepository;
    this.appUserRepository = appUserRepository;
    this.rateLimitConfig = rateLimitConfig;
  }

  @Transactional(readOnly = true)
  public SettingsResponse getSettings(Long userId) {
    Optional<UserSettings> settings = userSettingsRepository.findByUserId(userId);
    if (settings.isEmpty()) return DEFAULT_SETTINGS;
    return toResponse(settings.get());
  }

  @Transactional
  public SettingsResponse updateSettings(Long userId, UpdateSettingsRequest input) {
    rateLimitConfig.consume("settings:update", userId);

    Optional<UserSettings> existing = userSettingsRepository.findByUserId(userId);
    UserSettings settings;

    if (existing.isPresent()) {
      settings = existing.get();
    } else {
      AppUser user =
          appUserRepository
              .findById(userId)
              .orElseThrow(() -> new ResourceNotFoundException("User not found"));
      settings = new UserSettings();
      settings.setUser(user);
      settings.setFormatter(DEFAULT_FORMATTER);
    }

    // Apply partial updates
    if (input.feedback() != null) {
      var fb = input.feedback();
      if (fb.showPassFail() != null) settings.setShowPassFail(fb.showPassFail());
      if (fb.showHints() != null) settings.setShowHints(fb.showHints());
      if (fb.showAssertionDetails() != null)
        settings.setShowAssertionDetails(fb.showAssertionDetails());
      if (fb.showDiff() != null) settings.setShowDiff(fb.showDiff());
      if (fb.showSolution() != null) settings.setShowSolution(fb.showSolution());
    }
    if (input.keybindings() != null) settings.setKeybindings(input.keybindings());
    if (input.darkMode() != null) settings.setDarkMode(input.darkMode());
    if (input.formatter() != null) settings.setFormatter(input.formatter());
    if (input.fileStubs() != null) settings.setFileStubs(input.fileStubs());
    if (input.traceMode() != null) settings.setTraceMode(input.traceMode());
    settings.setUpdatedAt(Instant.now());

    userSettingsRepository.save(settings);
    return toResponse(settings);
  }

  private SettingsResponse toResponse(UserSettings s) {
    return new SettingsResponse(
        new SettingsResponse.FeedbackConfig(
            s.getShowPassFail() != null ? s.getShowPassFail() : true,
            s.getShowHints() != null ? s.getShowHints() : true,
            s.getShowAssertionDetails() != null ? s.getShowAssertionDetails() : true,
            s.getShowDiff() != null ? s.getShowDiff() : false,
            s.getShowSolution() != null ? s.getShowSolution() : false),
        s.getKeybindings(),
        s.isDarkMode(),
        s.getFormatter() != null ? s.getFormatter() : DEFAULT_FORMATTER,
        s.getFileStubs() != null ? s.getFileStubs() : true,
        s.getTraceMode() != null ? s.getTraceMode() : false);
  }
}
