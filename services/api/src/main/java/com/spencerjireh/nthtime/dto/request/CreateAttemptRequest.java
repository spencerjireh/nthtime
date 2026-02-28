package com.spencerjireh.nthtime.dto.request;

public record CreateAttemptRequest(
    String challengeId, boolean passed, Object assertionResults, int hintsUsed) {}
