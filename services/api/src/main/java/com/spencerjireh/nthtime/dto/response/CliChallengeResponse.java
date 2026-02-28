package com.spencerjireh.nthtime.dto.response;

public record CliChallengeResponse(
    String slug,
    String title,
    String prompt,
    String difficulty,
    String[] hints,
    Object assertions,
    Object referenceSolution,
    String packSlug) {}
