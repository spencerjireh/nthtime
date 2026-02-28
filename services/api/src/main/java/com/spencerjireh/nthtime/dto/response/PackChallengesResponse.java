package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PackChallengesResponse(PackDetail pack, List<ChallengeSummaryResponse> challenges) {
  public record PackDetail(
      @JsonProperty("_id") String id,
      String name,
      String slug,
      String description,
      String language,
      String framework,
      String[] tags) {}
}
