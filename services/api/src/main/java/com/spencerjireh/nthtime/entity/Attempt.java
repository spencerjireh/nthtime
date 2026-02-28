package com.spencerjireh.nthtime.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "attempts")
public class Attempt {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private AppUser user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "challenge_id", nullable = false)
  private Challenge challenge;

  @Column(nullable = false)
  private boolean passed;

  @Type(JsonType.class)
  @Column(name = "assertion_results", nullable = false, columnDefinition = "jsonb")
  private Object assertionResults;

  @Column(name = "hints_used", nullable = false)
  private int hintsUsed = 0;

  @Column(name = "time_seconds")
  private Integer timeSeconds;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  public Attempt() {}

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

  public Challenge getChallenge() {
    return challenge;
  }

  public void setChallenge(Challenge challenge) {
    this.challenge = challenge;
  }

  public boolean isPassed() {
    return passed;
  }

  public void setPassed(boolean passed) {
    this.passed = passed;
  }

  public Object getAssertionResults() {
    return assertionResults;
  }

  public void setAssertionResults(Object assertionResults) {
    this.assertionResults = assertionResults;
  }

  public int getHintsUsed() {
    return hintsUsed;
  }

  public void setHintsUsed(int hintsUsed) {
    this.hintsUsed = hintsUsed;
  }

  public Integer getTimeSeconds() {
    return timeSeconds;
  }

  public void setTimeSeconds(Integer timeSeconds) {
    this.timeSeconds = timeSeconds;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
