package com.spencerjireh.nthtime.dto.response;

import java.util.List;

public record CliPackResponse(
    String name,
    String slug,
    String description,
    String language,
    String framework,
    List<CliChallengeSummary> challenges) {
  public record CliChallengeSummary(String slug, String title, String difficulty, int order) {}
}
