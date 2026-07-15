package com.spencerjireh.nthtime.controller;

import static com.spencerjireh.nthtime.util.SessionUtils.requireUserId;

import com.spencerjireh.nthtime.config.RateLimitConfig;
import com.spencerjireh.nthtime.dto.request.BackfillAttemptsRequest;
import com.spencerjireh.nthtime.dto.response.ProfileResponse;
import com.spencerjireh.nthtime.dto.response.StreakSnapshotResponse;
import com.spencerjireh.nthtime.service.AnonymousBackfillService;
import com.spencerjireh.nthtime.service.StreakService;
import com.spencerjireh.nthtime.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

  private final StreakService streakService;
  private final AnonymousBackfillService anonymousBackfillService;
  private final UserService userService;
  private final RateLimitConfig rateLimitConfig;

  public MeController(
      StreakService streakService,
      AnonymousBackfillService anonymousBackfillService,
      UserService userService,
      RateLimitConfig rateLimitConfig) {
    this.streakService = streakService;
    this.anonymousBackfillService = anonymousBackfillService;
    this.userService = userService;
    this.rateLimitConfig = rateLimitConfig;
  }

  @GetMapping("/streak")
  public StreakSnapshotResponse getStreak(HttpServletRequest request) {
    Long userId = requireUserId(request);
    return streakService.getStreakSnapshot(userId);
  }

  @GetMapping("/profile")
  public ProfileResponse getProfile(HttpServletRequest request) {
    Long userId = requireUserId(request);
    return userService.getProfile(userId);
  }

  @PostMapping("/backfill-attempts")
  public Map<String, Object> backfillAttempts(
      @RequestBody BackfillAttemptsRequest body, HttpServletRequest request) {
    Long userId = requireUserId(request);
    int inserted = anonymousBackfillService.backfill(userId, body);
    return Map.of("ok", true, "inserted", inserted);
  }

  @DeleteMapping
  public ResponseEntity<Void> deleteAccount(HttpServletRequest request) {
    Long userId = requireUserId(request);
    rateLimitConfig.consume("account:delete", userId);

    userService.deleteUser(userId);

    // deleteUser drops the user's sessions on other devices; end the current one here,
    // where the servlet types belong.
    HttpSession session = request.getSession(false);
    if (session != null) {
      session.invalidate();
    }
    SecurityContextHolder.clearContext();

    return ResponseEntity.noContent().build();
  }
}
