package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.config.RateLimitConfig;
import com.spencerjireh.nthtime.dto.request.CreateAttemptRequest;
import com.spencerjireh.nthtime.dto.response.AttemptResponse;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.Attempt;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttemptService {

  private final AttemptRepository attemptRepository;
  private final AppUserRepository appUserRepository;
  private final ChallengeRepository challengeRepository;
  private final RateLimitConfig rateLimitConfig;

  public AttemptService(
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
  public String createAttempt(Long userId, CreateAttemptRequest input) {
    rateLimitConfig.consume("attempts:create", userId);

    AppUser user =
        appUserRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    Challenge challenge =
        challengeRepository
            .findById(Long.parseLong(input.challengeId()))
            .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));

    Attempt attempt = new Attempt();
    attempt.setUser(user);
    attempt.setChallenge(challenge);
    attempt.setPassed(input.passed());
    attempt.setAssertionResults(input.assertionResults());
    attempt.setHintsUsed(input.hintsUsed());
    attempt = attemptRepository.save(attempt);

    return attempt.getId().toString();
  }

  @Transactional(readOnly = true)
  public List<AttemptResponse> listAttempts(Long userId, Long challengeId) {
    return attemptRepository.findByUserIdAndChallengeId(userId, challengeId).stream()
        .map(
            a ->
                new AttemptResponse(
                    a.getId().toString(),
                    a.getUser().getId().toString(),
                    a.getChallenge().getId().toString(),
                    a.isPassed(),
                    a.getAssertionResults(),
                    a.getHintsUsed()))
        .toList();
  }
}
