package com.spencerjireh.nthtime.dto.response;

import java.util.List;

public record AuthorPackExportResponse(
    String name,
    String slug,
    String description,
    String language,
    String framework,
    String version,
    String[] tags,
    List<ExportChallenge> challenges) {
  public record ExportChallenge(
      String slug,
      String title,
      String prompt,
      String difficulty,
      String[] tags,
      int timeEstimateSeconds,
      String[] hints,
      Object assertions,
      Object referenceSolution,
      int order) {}
}
