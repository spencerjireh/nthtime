package com.spencerjireh.nthtime.entity;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
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
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.Type;

@Entity
@Table(
    name = "challenges",
    uniqueConstraints = {
      @UniqueConstraint(columns = {"pack_id", "slug"}),
      @UniqueConstraint(columns = {"pack_id", "\"order\""})
    })
public class Challenge {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "pack_id", nullable = false)
  private Pack pack;

  @Column(nullable = false, length = 255)
  private String slug;

  @Column(nullable = false, length = 500)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String prompt = "";

  @Column(nullable = false, length = 20)
  private String difficulty = "beginner";

  @Type(StringArrayType.class)
  @Column(name = "tags", columnDefinition = "text[]")
  private String[] tags = {};

  @Column(name = "time_estimate_seconds", nullable = false)
  private int timeEstimateSeconds = 300;

  @Type(StringArrayType.class)
  @Column(name = "hints", columnDefinition = "text[]")
  private String[] hints = {};

  @Type(JsonType.class)
  @Column(nullable = false, columnDefinition = "jsonb")
  private Object assertions;

  @Type(JsonType.class)
  @Column(name = "reference_solution", nullable = false, columnDefinition = "jsonb")
  private Object referenceSolution;

  @Column(name = "\"order\"", nullable = false)
  private int order = 1;

  public Challenge() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Pack getPack() {
    return pack;
  }

  public void setPack(Pack pack) {
    this.pack = pack;
  }

  public String getSlug() {
    return slug;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getPrompt() {
    return prompt;
  }

  public void setPrompt(String prompt) {
    this.prompt = prompt;
  }

  public String getDifficulty() {
    return difficulty;
  }

  public void setDifficulty(String difficulty) {
    this.difficulty = difficulty;
  }

  public String[] getTags() {
    return tags;
  }

  public void setTags(String[] tags) {
    this.tags = tags;
  }

  public int getTimeEstimateSeconds() {
    return timeEstimateSeconds;
  }

  public void setTimeEstimateSeconds(int timeEstimateSeconds) {
    this.timeEstimateSeconds = timeEstimateSeconds;
  }

  public String[] getHints() {
    return hints;
  }

  public void setHints(String[] hints) {
    this.hints = hints;
  }

  public Object getAssertions() {
    return assertions;
  }

  public void setAssertions(Object assertions) {
    this.assertions = assertions;
  }

  public Object getReferenceSolution() {
    return referenceSolution;
  }

  public void setReferenceSolution(Object referenceSolution) {
    this.referenceSolution = referenceSolution;
  }

  public int getOrder() {
    return order;
  }

  public void setOrder(int order) {
    this.order = order;
  }
}
