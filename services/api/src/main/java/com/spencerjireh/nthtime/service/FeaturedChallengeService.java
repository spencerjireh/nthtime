package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.request.ScheduleFeaturedRequest;
import com.spencerjireh.nthtime.dto.response.ChallengeSummaryResponse;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.entity.FeaturedChallenge;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.exception.BadRequestException;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import com.spencerjireh.nthtime.repository.FeaturedChallengeRepository;
import com.spencerjireh.nthtime.repository.PackRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FeaturedChallengeService {

  private final FeaturedChallengeRepository featuredChallengeRepository;
  private final ChallengeRepository challengeRepository;
  private final PackRepository packRepository;
  private final Clock clock;

  // Spring picks this constructor for bean creation. The second constructor
  // (with an injected Clock) is reserved for unit tests that need a fixed
  // clock — Spring ignores it because of the explicit @Autowired below.
  @Autowired
  public FeaturedChallengeService(
      FeaturedChallengeRepository featuredChallengeRepository,
      ChallengeRepository challengeRepository,
      PackRepository packRepository) {
    this(featuredChallengeRepository, challengeRepository, packRepository, Clock.systemUTC());
  }

  public FeaturedChallengeService(
      FeaturedChallengeRepository featuredChallengeRepository,
      ChallengeRepository challengeRepository,
      PackRepository packRepository,
      Clock clock) {
    this.featuredChallengeRepository = featuredChallengeRepository;
    this.challengeRepository = challengeRepository;
    this.packRepository = packRepository;
    this.clock = clock;
  }

  public Optional<ChallengeSummaryResponse> getFeaturedForToday() {
    LocalDate today = LocalDate.now(clock);
    return featuredChallengeRepository.findByDate(today).map(fc -> toSummary(fc.getChallenge()));
  }

  /**
   * Batch schedule featured challenges. Each entry resolves to a {pack_slug, challenge_slug} pair
   * because challenge slugs are unique only within a pack. Any unknown slug fails the whole batch
   * (rollback via {@code @Transactional}) so curators see atomic results.
   */
  @Transactional
  public void scheduleFeatured(List<ScheduleFeaturedRequest> entries) {
    if (entries == null || entries.isEmpty()) return;

    for (ScheduleFeaturedRequest entry : entries) {
      Pack pack =
          packRepository
              .findBySlug(entry.packSlug())
              .orElseThrow(() -> new BadRequestException("Unknown pack slug: " + entry.packSlug()));

      Challenge challenge =
          challengeRepository
              .findByPackIdAndSlug(pack.getId(), entry.challengeSlug())
              .orElseThrow(
                  () ->
                      new BadRequestException(
                          "Unknown challenge slug: "
                              + entry.packSlug()
                              + "/"
                              + entry.challengeSlug()));

      FeaturedChallenge fc =
          featuredChallengeRepository.findByDate(entry.date()).orElseGet(FeaturedChallenge::new);
      fc.setDate(entry.date());
      fc.setChallenge(challenge);
      if (fc.getCreatedAt() == null) {
        fc.setCreatedAt(Instant.now());
      }
      featuredChallengeRepository.save(fc);
    }
  }

  @Transactional
  public boolean unschedule(LocalDate date) {
    Optional<FeaturedChallenge> existing = featuredChallengeRepository.findByDate(date);
    if (existing.isEmpty()) return false;
    featuredChallengeRepository.delete(existing.get());
    return true;
  }

  private ChallengeSummaryResponse toSummary(Challenge c) {
    return new ChallengeSummaryResponse(
        c.getId().toString(),
        c.getSlug(),
        c.getPack().getSlug(),
        c.getTitle(),
        c.getDifficulty(),
        c.getTags(),
        c.getTimeEstimateSeconds(),
        c.getOrder(),
        "not-attempted");
  }
}
