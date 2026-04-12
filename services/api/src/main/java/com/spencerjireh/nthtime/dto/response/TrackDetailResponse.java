package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record TrackDetailResponse(
    @JsonProperty("_id") String id,
    String slug,
    String title,
    String description,
    String longDescription,
    List<String> tags,
    List<TrackPackEntry> packs) {

  public record TrackPackEntry(
      @JsonProperty("_id") String id,
      String slug,
      String name,
      String description,
      String language,
      String framework,
      String[] tags,
      int challengeCount,
      int passedCount) {}
}
