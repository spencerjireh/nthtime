package com.spencerjireh.nthtime.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FeaturedChallengeServiceTest {

  private static final LocalDate TODAY = LocalDate.of(2026, 4, 15);
  private static final Clock FIXED_CLOCK =
      Clock.fixed(TODAY.atStartOfDay(ZoneOffset.UTC).toInstant(), ZoneOffset.UTC);

  @Mock private FeaturedChallengeRepository featuredChallengeRepository;
  @Mock private ChallengeRepository challengeRepository;
  @Mock private PackRepository packRepository;

  private FeaturedChallengeService service;

  @BeforeEach
  void setUp() {
    service =
        new FeaturedChallengeService(
            featuredChallengeRepository, challengeRepository, packRepository, FIXED_CLOCK);
  }

  private Pack pack(Long id, String slug) {
    Pack p = new Pack();
    p.setId(id);
    p.setSlug(slug);
    p.setLanguage("javascript");
    return p;
  }

  private Challenge challenge(Long id, String slug, String title) {
    Challenge c = new Challenge();
    c.setId(id);
    c.setSlug(slug);
    c.setTitle(title);
    c.setDifficulty("beginner");
    c.setTags(new String[] {});
    c.setTimeEstimateSeconds(300);
    c.setOrder(1);
    c.setPack(pack(1L, "express"));
    return c;
  }

  @Test
  void getFeaturedForTodayReturnsEmptyWhenNoRow() {
    when(featuredChallengeRepository.findByDate(TODAY)).thenReturn(Optional.empty());

    assertThat(service.getFeaturedForToday()).isEmpty();
  }

  @Test
  void getFeaturedForTodayReturnsSummaryWhenScheduled() {
    Challenge c = challenge(9L, "hello-world", "Hello, world!");
    FeaturedChallenge fc = new FeaturedChallenge();
    fc.setDate(TODAY);
    fc.setChallenge(c);
    when(featuredChallengeRepository.findByDate(TODAY)).thenReturn(Optional.of(fc));

    Optional<ChallengeSummaryResponse> result = service.getFeaturedForToday();

    assertThat(result).isPresent();
    assertThat(result.get().id()).isEqualTo("9");
    assertThat(result.get().slug()).isEqualTo("hello-world");
    assertThat(result.get().title()).isEqualTo("Hello, world!");
  }

  @Test
  void scheduleFeaturedBatchHappyPath() {
    Pack p = pack(1L, "express");
    when(packRepository.findBySlug("express")).thenReturn(Optional.of(p));
    when(challengeRepository.findByPackIdAndSlug(1L, "hello-world"))
        .thenReturn(Optional.of(challenge(9L, "hello-world", "Hello")));
    when(featuredChallengeRepository.findByDate(TODAY)).thenReturn(Optional.empty());

    service.scheduleFeatured(List.of(new ScheduleFeaturedRequest(TODAY, "express", "hello-world")));

    verify(featuredChallengeRepository).save(any(FeaturedChallenge.class));
  }

  @Test
  void scheduleFeaturedRollsBackOnUnknownSlug() {
    Pack p = pack(1L, "express");
    when(packRepository.findBySlug("express")).thenReturn(Optional.of(p));
    when(challengeRepository.findByPackIdAndSlug(1L, "known"))
        .thenReturn(Optional.of(challenge(9L, "known", "Known")));
    when(challengeRepository.findByPackIdAndSlug(1L, "ghost")).thenReturn(Optional.empty());
    when(featuredChallengeRepository.findByDate(TODAY)).thenReturn(Optional.empty());

    assertThatThrownBy(
            () ->
                service.scheduleFeatured(
                    List.of(
                        new ScheduleFeaturedRequest(TODAY, "express", "known"),
                        new ScheduleFeaturedRequest(TODAY.plusDays(1), "express", "ghost"))))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("ghost");

    // @Transactional would roll back in production. Under mocking we can at
    // least assert we never attempted to save the second (ghost) entry.
    verify(featuredChallengeRepository, never()).findByDate(TODAY.plusDays(1));
  }

  @Test
  void unscheduleReturnsFalseWhenAbsent() {
    when(featuredChallengeRepository.findByDate(TODAY)).thenReturn(Optional.empty());
    assertThat(service.unschedule(TODAY)).isFalse();
  }

  @Test
  void unscheduleReturnsTrueAndDeletesWhenPresent() {
    FeaturedChallenge fc = new FeaturedChallenge();
    fc.setDate(TODAY);
    when(featuredChallengeRepository.findByDate(TODAY)).thenReturn(Optional.of(fc));

    boolean result = service.unschedule(TODAY);

    assertThat(result).isTrue();
    verify(featuredChallengeRepository).delete(fc);
  }
}
