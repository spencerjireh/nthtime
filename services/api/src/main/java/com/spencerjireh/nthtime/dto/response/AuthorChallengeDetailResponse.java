package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthorChallengeDetailResponse(
    @JsonProperty("_id") String id,
    String packId,
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
