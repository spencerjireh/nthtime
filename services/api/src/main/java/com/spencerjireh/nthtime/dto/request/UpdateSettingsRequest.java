package com.spencerjireh.nthtime.dto.request;

public record UpdateSettingsRequest(
    FeedbackUpdate feedback,
    String keybindings,
    Boolean darkMode,
    Object formatter,
    Boolean fileStubs) {
  public record FeedbackUpdate(
      Boolean showPassFail,
      Boolean showHints,
      Boolean showAssertionDetails,
      Boolean showDiff,
      Boolean showSolution) {}
}
