package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.config.AdminSecretVerifier;
import com.spencerjireh.nthtime.dto.request.ScheduleFeaturedRequest;
import com.spencerjireh.nthtime.dto.response.ChallengeSummaryResponse;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.service.FeaturedChallengeService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FeaturedChallengeController {

  private final FeaturedChallengeService featuredChallengeService;
  private final AdminSecretVerifier adminSecretVerifier;

  public FeaturedChallengeController(
      FeaturedChallengeService featuredChallengeService, AdminSecretVerifier adminSecretVerifier) {
    this.featuredChallengeService = featuredChallengeService;
    this.adminSecretVerifier = adminSecretVerifier;
  }

  // Public — dashboard home page fetches this on every load.
  @GetMapping("/api/featured/today")
  public ResponseEntity<ChallengeSummaryResponse> getFeaturedToday() {
    Optional<ChallengeSummaryResponse> featured = featuredChallengeService.getFeaturedForToday();
    return featured.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
  }

  @PostMapping("/api/admin/featured")
  public ResponseEntity<Void> scheduleFeatured(
      @RequestHeader(value = "X-Admin-Secret", required = false) String adminSecret,
      @Valid @RequestBody ScheduleFeaturedRequest.Batch batch) {
    adminSecretVerifier.verify(adminSecret);
    featuredChallengeService.scheduleFeatured(batch.entries());
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/api/admin/featured/{date}")
  public ResponseEntity<Void> unscheduleFeatured(
      @RequestHeader(value = "X-Admin-Secret", required = false) String adminSecret,
      @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    adminSecretVerifier.verify(adminSecret);
    boolean removed = featuredChallengeService.unschedule(date);
    if (!removed) {
      throw new ResourceNotFoundException("No featured challenge scheduled for " + date);
    }
    return ResponseEntity.noContent().build();
  }
}
