package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.response.StreakSnapshotResponse;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StreakService {

  private static final int HEATMAP_DAYS = 84;

  private final AttemptRepository attemptRepository;
  private final Clock clock;

  // Spring picks this constructor. The second (Clock-accepting) constructor
  // is for unit tests that need a fixed clock.
  @Autowired
  public StreakService(AttemptRepository attemptRepository) {
    this(attemptRepository, Clock.systemUTC());
  }

  public StreakService(AttemptRepository attemptRepository, Clock clock) {
    this.attemptRepository = attemptRepository;
    this.clock = clock;
  }

  public StreakSnapshotResponse getStreakSnapshot(Long userId) {
    // Load passed-attempt timestamps across the user's full history so
    // `longestStreak` reflects lifetime best, not just the heatmap window.
    // Projection avoids pulling the JSONB assertion_results column.
    TreeMap<LocalDate, Integer> buckets = new TreeMap<>();
    for (Instant instant : attemptRepository.findPassedAtByUserId(userId)) {
      buckets.merge(instant.atOffset(ZoneOffset.UTC).toLocalDate(), 1, Integer::sum);
    }

    LocalDate today = LocalDate.now(clock);
    LocalDate yesterday = today.minusDays(1);

    LocalDate lastPassDate = buckets.isEmpty() ? null : buckets.lastKey();

    int currentStreak = 0;
    if (lastPassDate != null && (lastPassDate.equals(today) || lastPassDate.equals(yesterday))) {
      LocalDate cursor = lastPassDate;
      while (buckets.containsKey(cursor)) {
        currentStreak++;
        cursor = cursor.minusDays(1);
      }
    }

    int longestStreak = computeLongestStreak(buckets);

    List<StreakSnapshotResponse.HeatmapDay> heatmap = new ArrayList<>(HEATMAP_DAYS);
    LocalDate start = today.minusDays(HEATMAP_DAYS - 1);
    for (int i = 0; i < HEATMAP_DAYS; i++) {
      LocalDate day = start.plusDays(i);
      heatmap.add(new StreakSnapshotResponse.HeatmapDay(day, buckets.getOrDefault(day, 0)));
    }

    return new StreakSnapshotResponse(currentStreak, longestStreak, lastPassDate, heatmap);
  }

  private int computeLongestStreak(TreeMap<LocalDate, Integer> buckets) {
    if (buckets.isEmpty()) return 0;
    int longest = 0;
    int run = 0;
    LocalDate previous = null;
    for (LocalDate date : buckets.keySet()) {
      if (previous != null && date.equals(previous.plusDays(1))) {
        run++;
      } else {
        run = 1;
      }
      if (run > longest) longest = run;
      previous = date;
    }
    return longest;
  }
}
