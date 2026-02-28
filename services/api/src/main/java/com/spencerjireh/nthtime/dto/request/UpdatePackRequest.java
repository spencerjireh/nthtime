package com.spencerjireh.nthtime.dto.request;

public record UpdatePackRequest(
    String name,
    String slug,
    String description,
    String language,
    String framework,
    String version,
    String[] tags,
    String visibility) {}
