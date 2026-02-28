package com.spencerjireh.nthtime.dto.response;

import java.util.List;

public record PackListResponse(List<PackSummaryResponse> packs, List<String> availableTags) {}
