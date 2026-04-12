package com.spencerjireh.nthtime.dto.request;

import java.util.List;

public record SyncTracksRequest(String adminSecret, List<SeedTrackRequest> tracks) {}
