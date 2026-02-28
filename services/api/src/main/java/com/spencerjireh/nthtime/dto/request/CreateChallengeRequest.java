package com.spencerjireh.nthtime.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateChallengeRequest(
    @NotBlank String slug,
    @NotBlank String title,
    String prompt,
    String difficulty,
    String[] tags,
    int timeEstimateSeconds,
    String[] hints,
    Object assertions,
    Object referenceSolution) {}
