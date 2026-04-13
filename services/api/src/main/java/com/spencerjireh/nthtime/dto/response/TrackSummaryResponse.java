package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record TrackSummaryResponse(
    @JsonProperty("_id") String id,
    String slug,
    String title,
    String description,
    List<String> tags,
    int packCount,
    int totalChallenges,
    int passedChallenges) {}
