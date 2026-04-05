package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PackSummaryResponse(
    @JsonProperty("_id") String id,
    String name,
    String slug,
    String description,
    String language,
    String framework,
    String version,
    String author,
    String[] tags,
    String[] prerequisites,
    int challengeCount,
    int passedCount,
    String visibility) {}
