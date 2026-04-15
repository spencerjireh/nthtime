package com.spencerjireh.nthtime.dto.request;

import java.util.List;

public record SyncPacksRequest(List<SeedPackRequest> packs, List<SeedTrackRequest> tracks) {}
