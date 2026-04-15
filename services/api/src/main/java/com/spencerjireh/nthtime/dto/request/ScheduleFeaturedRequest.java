package com.spencerjireh.nthtime.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record ScheduleFeaturedRequest(
    @NotNull LocalDate date, @NotBlank String packSlug, @NotBlank String challengeSlug) {

  public record Batch(@NotEmpty List<@Valid ScheduleFeaturedRequest> entries) {}
}
