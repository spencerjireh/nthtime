package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.config.RateLimitConfig;
import com.spencerjireh.nthtime.dto.request.CreatePackRequest;
import com.spencerjireh.nthtime.dto.request.UpdatePackRequest;
import com.spencerjireh.nthtime.dto.response.AuthorPackDetailResponse;
import com.spencerjireh.nthtime.dto.response.AuthorPackExportResponse;
import com.spencerjireh.nthtime.dto.response.AuthorPackSummaryResponse;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.exception.ForbiddenException;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.exception.SlugConflictException;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import com.spencerjireh.nthtime.repository.PackRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthorPackService {

  private final PackRepository packRepository;
  private final ChallengeRepository challengeRepository;
  private final AttemptRepository attemptRepository;
  private final AppUserRepository appUserRepository;
  private final RateLimitConfig rateLimitConfig;

  public AuthorPackService(
      PackRepository packRepository,
      ChallengeRepository challengeRepository,
      AttemptRepository attemptRepository,
      AppUserRepository appUserRepository,
      RateLimitConfig rateLimitConfig) {
    this.packRepository = packRepository;
    this.challengeRepository = challengeRepository;
    this.attemptRepository = attemptRepository;
    this.appUserRepository = appUserRepository;
    this.rateLimitConfig = rateLimitConfig;
  }

  @Transactional(readOnly = true)
  public List<AuthorPackSummaryResponse> myPacks(Long userId) {
    List<Pack> packs = packRepository.findByAuthorUserId(userId);
    return packs.stream()
        .map(
            pack -> {
              int challengeCount = challengeRepository.countByPackId(pack.getId());
              return new AuthorPackSummaryResponse(
                  pack.getId().toString(),
                  pack.getName(),
                  pack.getSlug(),
                  pack.getDescription(),
                  pack.getLanguage(),
                  pack.getFramework(),
                  pack.getVersion(),
                  pack.getTags(),
                  pack.getPrerequisites(),
                  pack.getVisibility(),
                  challengeCount,
                  pack.getCreatedAt() != null ? pack.getCreatedAt().toString() : null,
                  pack.getUpdatedAt() != null ? pack.getUpdatedAt().toString() : null);
            })
        .toList();
  }

  @Transactional(readOnly = true)
  public AuthorPackDetailResponse getBySlug(Long userId, String slug) {
    Pack pack = packRepository.findBySlug(slug).orElse(null);
    if (pack == null) return null;
    verifyOwnership(pack, userId);

    List<Challenge> challenges = challengeRepository.findByPackIdOrderByOrderAsc(pack.getId());
    List<AuthorPackDetailResponse.AuthorChallengeSummary> summaries =
        challenges.stream()
            .map(
                c ->
                    new AuthorPackDetailResponse.AuthorChallengeSummary(
                        c.getId().toString(),
                        c.getSlug(),
                        c.getTitle(),
                        c.getDifficulty(),
                        c.getTags(),
                        c.getTimeEstimateSeconds(),
                        c.getOrder()))
            .toList();

    return new AuthorPackDetailResponse(
        pack.getId().toString(),
        pack.getName(),
        pack.getSlug(),
        pack.getDescription(),
        pack.getLanguage(),
        pack.getFramework(),
        pack.getVersion(),
        pack.getTags(),
        pack.getPrerequisites(),
        pack.getVisibility(),
        summaries);
  }

  @Transactional(readOnly = true)
  public AuthorPackExportResponse getForExport(Long userId, String slug) {
    Pack pack = packRepository.findBySlug(slug).orElse(null);
    if (pack == null) return null;
    verifyOwnership(pack, userId);

    List<Challenge> challenges = challengeRepository.findByPackIdOrderByOrderAsc(pack.getId());
    List<AuthorPackExportResponse.ExportChallenge> exportChallenges =
        challenges.stream()
            .map(
                c ->
                    new AuthorPackExportResponse.ExportChallenge(
                        c.getSlug(),
                        c.getTitle(),
                        c.getPrompt(),
                        c.getDifficulty(),
                        c.getTags(),
                        c.getTimeEstimateSeconds(),
                        c.getHints(),
                        c.getAssertions(),
                        c.getReferenceSolution(),
                        c.getOrder()))
            .toList();

    return new AuthorPackExportResponse(
        pack.getName(),
        pack.getSlug(),
        pack.getDescription(),
        pack.getLanguage(),
        pack.getFramework(),
        pack.getVersion(),
        pack.getTags(),
        pack.getPrerequisites(),
        exportChallenges);
  }

  @Transactional(readOnly = true)
  public boolean checkSlugAvailable(String slug, Long excludePackId) {
    Pack existing = packRepository.findBySlug(slug).orElse(null);
    if (existing == null) return true;
    return excludePackId != null && existing.getId().equals(excludePackId);
  }

  @Transactional
  public Long createPack(Long userId, CreatePackRequest input) {
    rateLimitConfig.consume("authorPacks:write", userId);

    if (packRepository.existsBySlug(input.slug())) {
      throw new SlugConflictException("Slug already taken");
    }

    AppUser user =
        appUserRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Pack pack = new Pack();
    pack.setName(input.name());
    pack.setSlug(input.slug());
    pack.setDescription(input.description() != null ? input.description() : "");
    pack.setLanguage(input.language());
    pack.setFramework(input.framework());
    pack.setVersion(input.version() != null ? input.version() : "1.0.0");
    pack.setTags(input.tags() != null ? input.tags() : new String[] {});
    pack.setPrerequisites(input.prerequisites() != null ? input.prerequisites() : new String[] {});
    pack.setAuthorUser(user);
    pack.setVisibility(input.visibility() != null ? input.visibility() : "public");
    pack.setCreatedAt(Instant.now());
    pack.setUpdatedAt(Instant.now());

    return packRepository.save(pack).getId();
  }

  @Transactional
  public void updatePack(Long userId, Long packId, UpdatePackRequest input) {
    rateLimitConfig.consume("authorPacks:write", userId);

    Pack pack =
        packRepository
            .findById(packId)
            .orElseThrow(() -> new ResourceNotFoundException("Pack not found"));
    verifyOwnership(pack, userId);

    if (input.slug() != null && !input.slug().equals(pack.getSlug())) {
      if (packRepository.existsBySlug(input.slug())) {
        throw new SlugConflictException("Slug already taken");
      }
      pack.setSlug(input.slug());
    }

    if (input.name() != null) pack.setName(input.name());
    if (input.description() != null) pack.setDescription(input.description());
    if (input.language() != null) pack.setLanguage(input.language());
    if (input.framework() != null) pack.setFramework(input.framework());
    if (input.version() != null) pack.setVersion(input.version());
    if (input.tags() != null) pack.setTags(input.tags());
    if (input.prerequisites() != null) pack.setPrerequisites(input.prerequisites());
    if (input.visibility() != null) pack.setVisibility(input.visibility());
    pack.setUpdatedAt(Instant.now());

    packRepository.save(pack);
  }

  @Transactional
  public void removePack(Long userId, Long packId) {
    rateLimitConfig.consume("authorPacks:write", userId);

    Pack pack =
        packRepository
            .findById(packId)
            .orElseThrow(() -> new ResourceNotFoundException("Pack not found"));
    verifyOwnership(pack, userId);

    // Delete all attempts for all challenges in this pack
    List<Challenge> challenges = challengeRepository.findByPackIdOrderByOrderAsc(packId);
    for (Challenge challenge : challenges) {
      attemptRepository.deleteByChallengeId(challenge.getId());
    }

    challengeRepository.deleteAllByPackId(packId);
    packRepository.delete(pack);
  }

  Pack verifyPackOwnership(Long packId, Long userId) {
    Pack pack =
        packRepository
            .findById(packId)
            .orElseThrow(() -> new ResourceNotFoundException("Pack not found or not owned by you"));
    verifyOwnership(pack, userId);
    return pack;
  }

  private void verifyOwnership(Pack pack, Long userId) {
    Long authorId = pack.getAuthorUser() != null ? pack.getAuthorUser().getId() : null;
    if (!userId.equals(authorId)) {
      throw new ForbiddenException("Pack not found or not owned by you");
    }
  }
}
