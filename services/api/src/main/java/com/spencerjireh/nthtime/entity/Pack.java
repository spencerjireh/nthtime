package com.spencerjireh.nthtime.entity;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
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
@Table(name = "packs")
public class Pack {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 255)
  private String name;

  @Column(nullable = false, unique = true, length = 255)
  private String slug;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String description = "";

  @Column(nullable = false, length = 50)
  private String language;

  @Column(length = 100)
  private String framework;

  @Column(nullable = false, length = 50)
  private String version = "1.0.0";

  @Column(nullable = false, length = 255)
  private String author = "";

  @Type(StringArrayType.class)
  @Column(name = "tags", columnDefinition = "text[]")
  private String[] tags = {};

  @Type(StringArrayType.class)
  @Column(name = "prerequisites", columnDefinition = "text[]")
  private String[] prerequisites = {};

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_user_id")
  private AppUser authorUser;

  @Column(nullable = false, length = 20)
  private String visibility = "public";

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  public Pack() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getSlug() {
    return slug;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }

  public String getFramework() {
    return framework;
  }

  public void setFramework(String framework) {
    this.framework = framework;
  }

  public String getVersion() {
    return version;
  }

  public void setVersion(String version) {
    this.version = version;
  }

  public String getAuthor() {
    return author;
  }

  public void setAuthor(String author) {
    this.author = author;
  }

  public String[] getTags() {
    return tags;
  }

  public void setTags(String[] tags) {
    this.tags = tags;
  }

  public String[] getPrerequisites() {
    return prerequisites;
  }

  public void setPrerequisites(String[] prerequisites) {
    this.prerequisites = prerequisites;
  }

  public AppUser getAuthorUser() {
    return authorUser;
  }

  public void setAuthorUser(AppUser authorUser) {
    this.authorUser = authorUser;
  }

  public String getVisibility() {
    return visibility;
  }

  public void setVisibility(String visibility) {
    this.visibility = visibility;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
