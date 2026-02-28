package com.spencerjireh.nthtime.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreatePackRequest(
    @NotBlank String name,
    @NotBlank String slug,
    String description,
    @NotBlank String language,
    String framework,
    String version,
    String[] tags,
    String visibility) {}
