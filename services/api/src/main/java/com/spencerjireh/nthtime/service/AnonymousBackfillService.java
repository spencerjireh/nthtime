package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.config.RateLimitConfig;
import com.spencerjireh.nthtime.dto.request.BackfillAttemptsRequest;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.Attempt;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.exception.PayloadTooLargeException;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnonymousBackfillService {

  private static final Logger log = LoggerFactory.getLogger(AnonymousBackfillService.class);
  private static final int MAX_ENTRIES = 500;

  private final AttemptRepository attemptRepository;
  private final AppUserRepository appUserRepository;
  private final ChallengeRepository challengeRepository;
  private final RateLimitConfig rateLimitConfig;

  public AnonymousBackfillService(
      AttemptRepository attemptRepository,
      AppUserRepository appUserRepository,
      ChallengeRepository challengeRepository,
      RateLimitConfig rateLimitConfig) {
    this.attemptRepository = attemptRepository;
    this.appUserRepository = appUserRepository;
    this.challengeRepository = challengeRepository;
    this.rateLimitConfig = rateLimitConfig;
  }

  @Transactional
  public int backfill(Long userId, BackfillAttemptsRequest request) {
    rateLimitConfig.consume("attempts:backfill", userId);

    List<BackfillAttemptsRequest.Entry> entries =
        request == null || request.entries() == null ? List.of() : request.entries();

    if (entries.size() > MAX_ENTRIES) {
      throw new PayloadTooLargeException(
          "Backfill body too large: " + entries.size() + " > " + MAX_ENTRIES);
    }
    if (entries.isEmpty()) return 0;

    AppUser user =
        appUserRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // Single pass: parse + null-filter once, then bulk-resolve challenges.
    List<Parsed> parsed = new ArrayList<>(entries.size());
    for (BackfillAttemptsRequest.Entry e : entries) {
      if (e == null || e.challengeId() == null || e.passedAt() == null) continue;
      try {
        parsed.add(new Parsed(Long.parseLong(e.challengeId()), e.passedAt()));
      } catch (NumberFormatException ignored) {
        // malformed id — skipped silently
      }
    }

    Map<Long, Challenge> byId =
        challengeRepository.findAllById(parsed.stream().map(Parsed::challengeId).toList()).stream()
            .collect(Collectors.toMap(Challenge::getId, c -> c));

    int inserted = 0;
    Instant now = Instant.now();
    for (Parsed p : parsed) {
      Challenge challenge = byId.get(p.challengeId());
      if (challenge == null) {
        log.info("Skipping backfill for unknown challenge id={} user={}", p.challengeId(), userId);
        continue;
      }

      Attempt attempt = new Attempt();
      attempt.setUser(user);
      attempt.setChallenge(challenge);
      attempt.setPassed(true);
      attempt.setAssertionResults(new HashMap<>());
      attempt.setHintsUsed(0);
      attempt.setCreatedAt(p.passedAt().isAfter(now) ? now : p.passedAt());
      attemptRepository.save(attempt);
      inserted++;
    }

    return inserted;
  }

  private record Parsed(Long challengeId, Instant passedAt) {}
}
