package com.spencerjireh.nthtime.dto.request;

import java.time.Instant;
import java.util.List;

public record BackfillAttemptsRequest(List<Entry> entries) {

  public record Entry(String challengeId, Instant passedAt) {}
}
