package com.spencerjireh.nthtime.controller;

import static com.spencerjireh.nthtime.util.SessionUtils.requireUserId;

import com.spencerjireh.nthtime.dto.request.BackfillAttemptsRequest;
import com.spencerjireh.nthtime.dto.response.StreakSnapshotResponse;
import com.spencerjireh.nthtime.service.AnonymousBackfillService;
import com.spencerjireh.nthtime.service.StreakService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
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

  public MeController(
      StreakService streakService, AnonymousBackfillService anonymousBackfillService) {
    this.streakService = streakService;
    this.anonymousBackfillService = anonymousBackfillService;
  }

  @GetMapping("/streak")
  public StreakSnapshotResponse getStreak(HttpServletRequest request) {
    Long userId = requireUserId(request);
    return streakService.getStreakSnapshot(userId);
  }

  @PostMapping("/backfill-attempts")
  public Map<String, Object> backfillAttempts(
      @RequestBody BackfillAttemptsRequest body, HttpServletRequest request) {
    Long userId = requireUserId(request);
    int inserted = anonymousBackfillService.backfill(userId, body);
    return Map.of("ok", true, "inserted", inserted);
  }
}
