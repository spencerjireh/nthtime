package com.spencerjireh.nthtime.dto.response;

import java.time.Instant;

public record ProfileResponse(
    String userId,
    String name,
    String email,
    String image,
    String provider,
    String handle,
    Instant createdAt) {}
