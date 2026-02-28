package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.config.RateLimitConfig;
import com.spencerjireh.nthtime.dto.request.CreateChallengeRequest;
import com.spencerjireh.nthtime.dto.request.UpdateChallengeRequest;
import com.spencerjireh.nthtime.dto.response.AuthorChallengeDetailResponse;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthorChallengeService {

  private final ChallengeRepository challengeRepository;
  private final AttemptRepository attemptRepository;
  private final AuthorPackService authorPackService;
  private final RateLimitConfig rateLimitConfig;

  public AuthorChallengeService(
      ChallengeRepository challengeRepository,
      AttemptRepository attemptRepository,
      AuthorPackService authorPackService,
      RateLimitConfig rateLimitConfig) {
    this.challengeRepository = challengeRepository;
    this.attemptRepository = attemptRepository;
    this.authorPackService = authorPackService;
    this.rateLimitConfig = rateLimitConfig;
  }

  @Transactional(readOnly = true)
  public AuthorChallengeDetailResponse getChallenge(Long userId, Long challengeId) {
    Challenge challenge = challengeRepository.findById(challengeId).orElse(null);
    if (challenge == null) return null;

    // Verify pack ownership
    authorPackService.verifyPackOwnership(challenge.getPack().getId(), userId);

    return toDetailResponse(challenge);
  }

  @Transactional
  public Long createChallenge(Long userId, Long packId, CreateChallengeRequest input) {
    rateLimitConfig.consume("authorChallenges:write", userId);

    Pack pack = authorPackService.verifyPackOwnership(packId, userId);
    int maxOrder = challengeRepository.findMaxOrderByPackId(pack.getId()).orElse(0);

    Challenge challenge = new Challenge();
    challenge.setPack(pack);
    challenge.setSlug(input.slug());
    challenge.setTitle(input.title());
    challenge.setPrompt(input.prompt() != null ? input.prompt() : "");
    challenge.setDifficulty(input.difficulty() != null ? input.difficulty() : "beginner");
    challenge.setTags(input.tags() != null ? input.tags() : new String[] {});
    challenge.setTimeEstimateSeconds(input.timeEstimateSeconds());
    challenge.setHints(input.hints() != null ? input.hints() : new String[] {});
    challenge.setAssertions(input.assertions());
    challenge.setReferenceSolution(input.referenceSolution());
    challenge.setOrder(maxOrder + 1);

    return challengeRepository.save(challenge).getId();
  }

  @Transactional
  public void updateChallenge(Long userId, Long challengeId, UpdateChallengeRequest input) {
    rateLimitConfig.consume("authorChallenges:write", userId);

    Challenge challenge =
        challengeRepository
            .findById(challengeId)
            .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));
    authorPackService.verifyPackOwnership(challenge.getPack().getId(), userId);

    // Delete ALL attempts for this challenge (content changed, previous results invalid)
    attemptRepository.deleteByChallengeId(challengeId);

    if (input.slug() != null) challenge.setSlug(input.slug());
    if (input.title() != null) challenge.setTitle(input.title());
    if (input.prompt() != null) challenge.setPrompt(input.prompt());
    if (input.difficulty() != null) challenge.setDifficulty(input.difficulty());
    if (input.tags() != null) challenge.setTags(input.tags());
    if (input.timeEstimateSeconds() != null)
      challenge.setTimeEstimateSeconds(input.timeEstimateSeconds());
    if (input.hints() != null) challenge.setHints(input.hints());
    if (input.assertions() != null) challenge.setAssertions(input.assertions());
    if (input.referenceSolution() != null)
      challenge.setReferenceSolution(input.referenceSolution());

    challengeRepository.save(challenge);
  }

  @Transactional
  public void removeChallenge(Long userId, Long challengeId) {
    rateLimitConfig.consume("authorChallenges:write", userId);

    Challenge challenge =
        challengeRepository
            .findById(challengeId)
            .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));
    Long packId = challenge.getPack().getId();
    authorPackService.verifyPackOwnership(packId, userId);

    // Delete attempts for this challenge
    attemptRepository.deleteByChallengeId(challengeId);

    // Delete the challenge
    challengeRepository.delete(challenge);

    // Renumber remaining challenges
    List<Challenge> remaining = challengeRepository.findByPackIdOrderByOrderAsc(packId);
    for (int i = 0; i < remaining.size(); i++) {
      Challenge c = remaining.get(i);
      if (c.getOrder() != i + 1) {
        c.setOrder(i + 1);
        challengeRepository.save(c);
      }
    }
  }

  @Transactional
  public void reorderChallenges(Long userId, Long packId, List<Long> challengeIds) {
    rateLimitConfig.consume("authorChallenges:write", userId);

    authorPackService.verifyPackOwnership(packId, userId);

    for (int i = 0; i < challengeIds.size(); i++) {
      Challenge challenge =
          challengeRepository
              .findById(challengeIds.get(i))
              .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));
      challenge.setOrder(i + 1);
      challengeRepository.save(challenge);
    }
  }

  private AuthorChallengeDetailResponse toDetailResponse(Challenge c) {
    return new AuthorChallengeDetailResponse(
        c.getId().toString(),
        c.getPack().getId().toString(),
        c.getSlug(),
        c.getTitle(),
        c.getPrompt(),
        c.getDifficulty(),
        c.getTags(),
        c.getTimeEstimateSeconds(),
        c.getHints(),
        c.getAssertions(),
        c.getReferenceSolution(),
        c.getOrder());
  }
}
