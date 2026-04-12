package com.spencerjireh.nthtime.dto.response;

import java.util.List;

public record CliTrackDetailResponse(
    String slug, String title, String description, List<CliTrackPack> packs) {

  public record CliTrackPack(String slug, String name, int position) {}
}
