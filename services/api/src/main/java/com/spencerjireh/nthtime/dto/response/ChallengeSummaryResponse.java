package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ChallengeSummaryResponse(
    @JsonProperty("_id") String id,
    String slug,
    String title,
    String difficulty,
    String[] tags,
    int timeEstimateSeconds,
    int order,
    String status) {}
