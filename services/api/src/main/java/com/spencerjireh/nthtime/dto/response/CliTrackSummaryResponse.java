package com.spencerjireh.nthtime.dto.response;

public record CliTrackSummaryResponse(
    String slug, String title, String description, int packCount) {}
