package com.spencerjireh.nthtime.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateTrackRequest(
    @NotBlank String slug,
    @NotBlank String title,
    String description,
    String longDescription,
    List<String> tags,
    List<String> packSlugs) {}
