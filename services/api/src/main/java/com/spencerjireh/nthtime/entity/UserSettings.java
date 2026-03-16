package com.spencerjireh.nthtime.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "user_settings")
public class UserSettings {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private AppUser user;

  @Column(name = "show_pass_fail")
  private Boolean showPassFail = true;

  @Column(name = "show_hints")
  private Boolean showHints = true;

  @Column(name = "show_assertion_details")
  private Boolean showAssertionDetails = true;

  @Column(name = "show_diff")
  private Boolean showDiff = false;

  @Column(name = "show_solution")
  private Boolean showSolution = false;

  @Column(nullable = false, length = 20)
  private String keybindings = "default";

  @Column(name = "dark_mode", nullable = false)
  private boolean darkMode = true;

  @Type(JsonType.class)
  @Column(nullable = false, columnDefinition = "jsonb")
  private Object formatter;

  @Column(name = "file_stubs")
  private Boolean fileStubs = true;

  @Column(name = "trace_mode")
  private Boolean traceMode = false;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  public UserSettings() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public AppUser getUser() {
    return user;
  }

  public void setUser(AppUser user) {
    this.user = user;
  }

  public Boolean getShowPassFail() {
    return showPassFail;
  }

  public void setShowPassFail(Boolean showPassFail) {
    this.showPassFail = showPassFail;
  }

  public Boolean getShowHints() {
    return showHints;
  }

  public void setShowHints(Boolean showHints) {
    this.showHints = showHints;
  }

  public Boolean getShowAssertionDetails() {
    return showAssertionDetails;
  }

  public void setShowAssertionDetails(Boolean showAssertionDetails) {
    this.showAssertionDetails = showAssertionDetails;
  }

  public Boolean getShowDiff() {
    return showDiff;
  }

  public void setShowDiff(Boolean showDiff) {
    this.showDiff = showDiff;
  }

  public Boolean getShowSolution() {
    return showSolution;
  }

  public void setShowSolution(Boolean showSolution) {
    this.showSolution = showSolution;
  }

  public String getKeybindings() {
    return keybindings;
  }

  public void setKeybindings(String keybindings) {
    this.keybindings = keybindings;
  }

  public boolean isDarkMode() {
    return darkMode;
  }

  public void setDarkMode(boolean darkMode) {
    this.darkMode = darkMode;
  }

  public Object getFormatter() {
    return formatter;
  }

  public void setFormatter(Object formatter) {
    this.formatter = formatter;
  }

  public Boolean getFileStubs() {
    return fileStubs;
  }

  public void setFileStubs(Boolean fileStubs) {
    this.fileStubs = fileStubs;
  }

  public Boolean getTraceMode() {
    return traceMode;
  }

  public void setTraceMode(Boolean traceMode) {
    this.traceMode = traceMode;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
