package com.spencerjireh.nthtime.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.spencerjireh.nthtime.dto.response.StreakSnapshotResponse;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StreakServiceTest {

  private static final Long USER_ID = 42L;
  private static final LocalDate TODAY = LocalDate.of(2026, 4, 15);
  private static final Clock FIXED_CLOCK =
      Clock.fixed(TODAY.atStartOfDay(ZoneOffset.UTC).toInstant(), ZoneOffset.UTC);

  @Mock private AttemptRepository attemptRepository;

  private StreakService newService() {
    return new StreakService(attemptRepository, FIXED_CLOCK);
  }

  private static Instant instantOn(LocalDate date) {
    return date.atStartOfDay(ZoneOffset.UTC).toInstant();
  }

  @Test
  void emptyHistoryReturnsZero() {
    when(attemptRepository.findPassedAtByUserId(USER_ID)).thenReturn(List.of());
    StreakSnapshotResponse snap = newService().getStreakSnapshot(USER_ID);

    assertThat(snap.currentStreak()).isZero();
    assertThat(snap.longestStreak()).isZero();
    assertThat(snap.lastPassDate()).isNull();
    assertThat(snap.heatmap()).hasSize(84);
    assertThat(snap.heatmap()).allMatch(day -> day.count() == 0);
  }

  @Test
  void singlePassTodayIsOneOne() {
    when(attemptRepository.findPassedAtByUserId(USER_ID)).thenReturn(List.of(instantOn(TODAY)));

    StreakSnapshotResponse snap = newService().getStreakSnapshot(USER_ID);

    assertThat(snap.currentStreak()).isEqualTo(1);
    assertThat(snap.longestStreak()).isEqualTo(1);
    assertThat(snap.lastPassDate()).isEqualTo(TODAY);
  }

  @Test
  void threeConsecutiveEndingTodayIsThreeThree() {
    List<Instant> instants =
        List.of(instantOn(TODAY.minusDays(2)), instantOn(TODAY.minusDays(1)), instantOn(TODAY));
    when(attemptRepository.findPassedAtByUserId(USER_ID)).thenReturn(instants);

    StreakSnapshotResponse snap = newService().getStreakSnapshot(USER_ID);

    assertThat(snap.currentStreak()).isEqualTo(3);
    assertThat(snap.longestStreak()).isEqualTo(3);
    assertThat(snap.lastPassDate()).isEqualTo(TODAY);
  }

  @Test
  void threeConsecutiveEndingYesterdayStillCountsForCurrentAndFlagsAtRisk() {
    List<Instant> instants =
        List.of(
            instantOn(TODAY.minusDays(3)),
            instantOn(TODAY.minusDays(2)),
            instantOn(TODAY.minusDays(1)));
    when(attemptRepository.findPassedAtByUserId(USER_ID)).thenReturn(instants);

    StreakSnapshotResponse snap = newService().getStreakSnapshot(USER_ID);

    assertThat(snap.currentStreak()).isEqualTo(3);
    assertThat(snap.longestStreak()).isEqualTo(3);
    // Client detects at-risk by comparing lastPassDate to today.
    assertThat(snap.lastPassDate()).isEqualTo(TODAY.minusDays(1));
  }

  @Test
  void strictMathCaseElevenNotTwelve() {
    // Passes on days 1..11 (counting backwards from TODAY), no pass today.
    // currentStreak should be 11 (not 12), and lastPassDate should be the
    // most-recent day that has an actual pass.
    List<Instant> instants = new ArrayList<>();
    for (int i = 1; i <= 11; i++) {
      instants.add(instantOn(TODAY.minusDays(i)));
    }
    when(attemptRepository.findPassedAtByUserId(USER_ID)).thenReturn(instants);

    StreakSnapshotResponse snap = newService().getStreakSnapshot(USER_ID);

    assertThat(snap.currentStreak()).isEqualTo(11);
    assertThat(snap.longestStreak()).isEqualTo(11);
    assertThat(snap.lastPassDate()).isEqualTo(TODAY.minusDays(1));
  }

  @Test
  void strictMathResetsWhenLastPassIsOlderThanYesterday() {
    // Three consecutive days ending two days ago. `currentStreak` must
    // reset to zero because the walk-start date (two days ago) is neither
    // today nor yesterday.
    List<Instant> instants =
        List.of(
            instantOn(TODAY.minusDays(4)),
            instantOn(TODAY.minusDays(3)),
            instantOn(TODAY.minusDays(2)));
    when(attemptRepository.findPassedAtByUserId(USER_ID)).thenReturn(instants);

    StreakSnapshotResponse snap = newService().getStreakSnapshot(USER_ID);

    assertThat(snap.currentStreak()).isZero();
    assertThat(snap.longestStreak()).isEqualTo(3);
    assertThat(snap.lastPassDate()).isEqualTo(TODAY.minusDays(2));
  }

  @Test
  void gappedRunsContributeOnlyToLongest() {
    // Pattern: three in a row ending 5 days ago, a 2-day gap, one pass
    // today. Current = 1 (today only), longest = 3.
    List<Instant> instants =
        List.of(
            instantOn(TODAY.minusDays(7)),
            instantOn(TODAY.minusDays(6)),
            instantOn(TODAY.minusDays(5)),
            instantOn(TODAY));
    when(attemptRepository.findPassedAtByUserId(USER_ID)).thenReturn(instants);

    StreakSnapshotResponse snap = newService().getStreakSnapshot(USER_ID);

    assertThat(snap.currentStreak()).isEqualTo(1);
    assertThat(snap.longestStreak()).isEqualTo(3);
  }

  @Test
  void heatmapHasEightyFourDaysAndCorrectCounts() {
    // Multiple passes on the same UTC day should increment the same bucket.
    Instant morning = TODAY.atTime(2, 0).toInstant(ZoneOffset.UTC);
    Instant afternoon = TODAY.atTime(14, 30).toInstant(ZoneOffset.UTC);

    when(attemptRepository.findPassedAtByUserId(USER_ID)).thenReturn(List.of(morning, afternoon));

    StreakSnapshotResponse snap = newService().getStreakSnapshot(USER_ID);

    assertThat(snap.heatmap()).hasSize(84);
    StreakSnapshotResponse.HeatmapDay todayCell = snap.heatmap().get(83);
    assertThat(todayCell.date()).isEqualTo(TODAY);
    assertThat(todayCell.count()).isEqualTo(2);
  }
}
