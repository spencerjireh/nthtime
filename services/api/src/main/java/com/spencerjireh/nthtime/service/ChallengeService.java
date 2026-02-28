package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.response.ChallengeResponse;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import com.spencerjireh.nthtime.repository.PackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ChallengeService {

  private final ChallengeRepository challengeRepository;
  private final PackRepository packRepository;

  public ChallengeService(ChallengeRepository challengeRepository, PackRepository packRepository) {
    this.challengeRepository = challengeRepository;
    this.packRepository = packRepository;
  }

  public ChallengeResponse getChallenge(Long id) {
    return challengeRepository.findById(id).map(this::toResponse).orElse(null);
  }

  public ChallengeResponse getByPackAndOrder(String packSlug, int order) {
    Pack pack = packRepository.findBySlug(packSlug).orElse(null);
    if (pack == null) return null;
    return challengeRepository
        .findByPackIdAndOrder(pack.getId(), order)
        .map(this::toResponse)
        .orElse(null);
  }

  public ChallengeResponse getByPackAndSlug(String packSlug, String challengeSlug) {
    Pack pack = packRepository.findBySlug(packSlug).orElse(null);
    if (pack == null) return null;
    return challengeRepository
        .findByPackIdAndSlug(pack.getId(), challengeSlug)
        .map(this::toResponse)
        .orElse(null);
  }

  private ChallengeResponse toResponse(Challenge c) {
    return new ChallengeResponse(
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
