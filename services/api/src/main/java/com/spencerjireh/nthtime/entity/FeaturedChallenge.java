package com.spencerjireh.nthtime.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "featured_challenges")
public class FeaturedChallenge {

  @Id
  @Column(name = "date", nullable = false)
  private LocalDate date;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "challenge_id", nullable = false)
  private Challenge challenge;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  public FeaturedChallenge() {}

  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public Challenge getChallenge() {
    return challenge;
  }

  public void setChallenge(Challenge challenge) {
    this.challenge = challenge;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
