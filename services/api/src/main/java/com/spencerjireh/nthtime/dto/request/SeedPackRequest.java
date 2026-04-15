package com.spencerjireh.nthtime.dto.request;

import java.util.List;

public record SeedPackRequest(
    String name,
    String slug,
    String description,
    String language,
    String framework,
    String version,
    String author,
    List<String> tags,
    List<String> prerequisites,
    List<SeedChallengeData> challenges) {
  public record SeedChallengeData(
      String slug,
      String title,
      String prompt,
      String difficulty,
      List<String> tags,
      int timeEstimateSeconds,
      List<String> hints,
      Object assertions,
      Object referenceSolution) {}
}
