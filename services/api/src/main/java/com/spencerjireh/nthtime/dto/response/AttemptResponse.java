package com.spencerjireh.nthtime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AttemptResponse(
    @JsonProperty("_id") String id,
    String userId,
    String challengeId,
    boolean passed,
    Object assertionResults,
    int hintsUsed) {}
