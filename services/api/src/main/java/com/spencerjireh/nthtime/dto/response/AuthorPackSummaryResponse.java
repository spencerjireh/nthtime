package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthorPackSummaryResponse(
    @JsonProperty("_id") String id,
    String name,
    String slug,
    String description,
    String language,
    String framework,
    String version,
    String[] tags,
    String[] prerequisites,
    String visibility,
    int challengeCount,
    String createdAt,
    String updatedAt) {}
