package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.List;

public record AuthorTrackDetailResponse(
    @JsonProperty("_id") String id,
    String slug,
    String title,
    String description,
    String longDescription,
    List<String> tags,
    List<String> packSlugs,
    int packCount,
    Instant createdAt,
    Instant updatedAt) {}
