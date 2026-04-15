package com.spencerjireh.nthtime.dto.response;

import java.time.LocalDate;
import java.util.List;

public record StreakSnapshotResponse(
    int currentStreak, int longestStreak, LocalDate lastPassDate, List<HeatmapDay> heatmap) {

  public record HeatmapDay(LocalDate date, int count) {}
}
