package com.spencerjireh.nthtime.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.spencerjireh.nthtime.config.RateLimitConfig;
import com.spencerjireh.nthtime.dto.request.BackfillAttemptsRequest;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.Attempt;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.exception.PayloadTooLargeException;
import com.spencerjireh.nthtime.exception.RateLimitExceededException;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AnonymousBackfillServiceTest {

  private static final Long USER_ID = 42L;

  @Mock private AttemptRepository attemptRepository;
  @Mock private AppUserRepository appUserRepository;
  @Mock private ChallengeRepository challengeRepository;
  @Mock private RateLimitConfig rateLimitConfig;

  private AnonymousBackfillService service;

  @BeforeEach
  void setUp() {
    service =
        new AnonymousBackfillService(
            attemptRepository, appUserRepository, challengeRepository, rateLimitConfig);
  }

  private Challenge challenge(Long id) {
    Challenge c = new Challenge();
    c.setId(id);
    c.setSlug("c-" + id);
    c.setTitle("Challenge " + id);
    c.setDifficulty("beginner");
    c.setTags(new String[] {});
    return c;
  }

  private BackfillAttemptsRequest request(List<BackfillAttemptsRequest.Entry> entries) {
    return new BackfillAttemptsRequest(entries);
  }

  @Test
  void happyPathInsertsOneAttemptPerEntryWithProvidedTimestamp() {
    AppUser user = new AppUser();
    user.setId(USER_ID);
    when(appUserRepository.findById(USER_ID)).thenReturn(Optional.of(user));
    when(challengeRepository.findAllById(anyIterable()))
        .thenReturn(List.of(challenge(1L), challenge(2L)));

    Instant t1 = Instant.parse("2026-04-10T12:00:00Z");
    Instant t2 = Instant.parse("2026-04-12T08:30:00Z");
    int inserted =
        service.backfill(
            USER_ID,
            request(
                List.of(
                    new BackfillAttemptsRequest.Entry("1", t1),
                    new BackfillAttemptsRequest.Entry("2", t2))));

    assertThat(inserted).isEqualTo(2);
    ArgumentCaptor<Attempt> captor = ArgumentCaptor.forClass(Attempt.class);
    verify(attemptRepository, times(2)).save(captor.capture());
    List<Attempt> saved = captor.getAllValues();
    assertThat(saved).allMatch(Attempt::isPassed);
    assertThat(saved.get(0).getCreatedAt()).isEqualTo(t1);
    assertThat(saved.get(1).getCreatedAt()).isEqualTo(t2);
    verify(rateLimitConfig).consume("attempts:backfill", USER_ID);
  }

  @Test
  void unknownChallengeIdIsSkippedSilently() {
    AppUser user = new AppUser();
    user.setId(USER_ID);
    when(appUserRepository.findById(USER_ID)).thenReturn(Optional.of(user));
    when(challengeRepository.findAllById(anyIterable())).thenReturn(List.of(challenge(1L)));

    int inserted =
        service.backfill(
            USER_ID,
            request(
                List.of(
                    new BackfillAttemptsRequest.Entry("1", Instant.parse("2026-04-10T00:00:00Z")),
                    new BackfillAttemptsRequest.Entry(
                        "999", Instant.parse("2026-04-11T00:00:00Z")))));

    assertThat(inserted).isEqualTo(1);
    verify(attemptRepository, times(1)).save(any(Attempt.class));
  }

  @Test
  void bodyOverFiveHundredReturnsPayloadTooLarge() {
    List<BackfillAttemptsRequest.Entry> entries = new ArrayList<>();
    Instant now = Instant.parse("2026-04-10T00:00:00Z");
    for (int i = 0; i < 501; i++) {
      entries.add(new BackfillAttemptsRequest.Entry(String.valueOf(i), now));
    }

    assertThatThrownBy(() -> service.backfill(USER_ID, request(entries)))
        .isInstanceOf(PayloadTooLargeException.class);
    verify(attemptRepository, never()).save(any(Attempt.class));
  }

  @Test
  void rateLimitErrorPropagates() {
    doThrow(new RateLimitExceededException("nope"))
        .when(rateLimitConfig)
        .consume("attempts:backfill", USER_ID);

    assertThatThrownBy(
            () ->
                service.backfill(
                    USER_ID,
                    request(
                        List.of(
                            new BackfillAttemptsRequest.Entry(
                                "1", Instant.parse("2026-04-10T00:00:00Z"))))))
        .isInstanceOf(RateLimitExceededException.class);
  }

  @Test
  void emptyBodyReturnsZero() {
    assertThat(service.backfill(USER_ID, request(List.of()))).isZero();
    verify(attemptRepository, never()).save(any(Attempt.class));
  }
}
