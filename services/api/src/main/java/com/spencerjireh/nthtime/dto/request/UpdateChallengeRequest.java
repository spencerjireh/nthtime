package com.spencerjireh.nthtime.dto.request;

public record UpdateChallengeRequest(
    String slug,
    String title,
    String prompt,
    String difficulty,
    String[] tags,
    Integer timeEstimateSeconds,
    String[] hints,
    Object assertions,
    Object referenceSolution) {}
