package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SearchResultResponse(
    @JsonProperty("_id") String id,
    String packId,
    String slug,
    String title,
    String difficulty,
    String[] tags,
    int timeEstimateSeconds,
    int order) {}
