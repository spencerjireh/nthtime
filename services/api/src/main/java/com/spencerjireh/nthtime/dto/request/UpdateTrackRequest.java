package com.spencerjireh.nthtime.dto.request;

import java.util.List;

public record UpdateTrackRequest(
    String slug,
    String title,
    String description,
    String longDescription,
    List<String> tags,
    List<String> packSlugs) {}
