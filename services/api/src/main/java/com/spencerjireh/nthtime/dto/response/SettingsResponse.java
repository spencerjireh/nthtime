package com.spencerjireh.nthtime.dto.response;

public record SettingsResponse(
    FeedbackConfig feedback,
    String keybindings,
    boolean darkMode,
    Object formatter,
    boolean fileStubs,
    boolean traceMode) {
  public record FeedbackConfig(
      boolean showPassFail,
      boolean showHints,
      boolean showAssertionDetails,
      boolean showDiff,
      boolean showSolution) {}
}
