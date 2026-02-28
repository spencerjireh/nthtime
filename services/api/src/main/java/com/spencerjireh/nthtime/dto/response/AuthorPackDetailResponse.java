package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record AuthorPackDetailResponse(
    @JsonProperty("_id") String id,
    String name,
    String slug,
    String description,
    String language,
    String framework,
    String version,
    String[] tags,
    String visibility,
    List<AuthorChallengeSummary> challenges) {
  public record AuthorChallengeSummary(
      @JsonProperty("_id") String id,
      String slug,
      String title,
      String difficulty,
      String[] tags,
      int timeEstimateSeconds,
      int order) {}
}
