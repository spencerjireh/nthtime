package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.config.RateLimitConfig;
import com.spencerjireh.nthtime.dto.request.CreateTrackRequest;
import com.spencerjireh.nthtime.dto.request.UpdateTrackRequest;
import com.spencerjireh.nthtime.dto.response.AuthorTrackDetailResponse;
import com.spencerjireh.nthtime.dto.response.AuthorTrackSummaryResponse;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.entity.PackTrack;
import com.spencerjireh.nthtime.entity.Track;
import com.spencerjireh.nthtime.exception.ForbiddenException;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.exception.SlugConflictException;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.PackRepository;
import com.spencerjireh.nthtime.repository.PackTrackRepository;
import com.spencerjireh.nthtime.repository.TrackRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthorTrackService {

  private final TrackRepository trackRepository;
  private final PackTrackRepository packTrackRepository;
  private final PackRepository packRepository;
  private final AppUserRepository appUserRepository;
  private final RateLimitConfig rateLimitConfig;

  public AuthorTrackService(
      TrackRepository trackRepository,
      PackTrackRepository packTrackRepository,
      PackRepository packRepository,
      AppUserRepository appUserRepository,
      RateLimitConfig rateLimitConfig) {
    this.trackRepository = trackRepository;
    this.packTrackRepository = packTrackRepository;
    this.packRepository = packRepository;
    this.appUserRepository = appUserRepository;
    this.rateLimitConfig = rateLimitConfig;
  }

  @Transactional(readOnly = true)
  public List<AuthorTrackSummaryResponse> myTracks(Long userId) {
    List<Track> tracks = trackRepository.findByAuthorUserId(userId);
    return tracks.stream().map(this::toSummary).toList();
  }

  @Transactional(readOnly = true)
  public AuthorTrackDetailResponse getBySlug(Long userId, String slug) {
    Track track =
        trackRepository
            .findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
    verifyOwnership(track, userId);

    List<String> packSlugs = getOrderedPackSlugs(track.getId());

    return new AuthorTrackDetailResponse(
        track.getId().toString(),
        track.getSlug(),
        track.getTitle(),
        track.getDescription(),
        track.getLongDescription(),
        Arrays.asList(track.getTags()),
        packSlugs,
        packSlugs.size(),
        track.getCreatedAt(),
        track.getUpdatedAt());
  }

  @Transactional
  public Long createTrack(Long userId, CreateTrackRequest input) {
    rateLimitConfig.consume("authorTracks:write", userId);

    if (trackRepository.existsBySlug(input.slug())) {
      throw new SlugConflictException("Track slug already taken");
    }

    AppUser user =
        appUserRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Track track = new Track();
    track.setSlug(input.slug());
    track.setTitle(input.title());
    track.setDescription(input.description() != null ? input.description() : "");
    track.setLongDescription(input.longDescription() != null ? input.longDescription() : "");
    track.setTags(input.tags() != null ? input.tags().toArray(new String[0]) : new String[] {});
    track.setAuthorUser(user);
    track.setCreatedAt(Instant.now());
    track.setUpdatedAt(Instant.now());
    track = trackRepository.save(track);

    if (input.packSlugs() != null) {
      replacePackTracks(track, input.packSlugs());
    }

    return track.getId();
  }

  @Transactional
  public void updateTrack(Long userId, String slug, UpdateTrackRequest input) {
    rateLimitConfig.consume("authorTracks:write", userId);

    Track track =
        trackRepository
            .findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
    verifyOwnership(track, userId);

    if (input.slug() != null && !input.slug().equals(track.getSlug())) {
      if (trackRepository.existsBySlug(input.slug())) {
        throw new SlugConflictException("Track slug already taken");
      }
      track.setSlug(input.slug());
    }

    if (input.title() != null) track.setTitle(input.title());
    if (input.description() != null) track.setDescription(input.description());
    if (input.longDescription() != null) track.setLongDescription(input.longDescription());
    if (input.tags() != null) track.setTags(input.tags().toArray(new String[0]));
    track.setUpdatedAt(Instant.now());
    trackRepository.save(track);

    if (input.packSlugs() != null) {
      replacePackTracks(track, input.packSlugs());
    }
  }

  @Transactional
  public void removeTrack(Long userId, String slug) {
    rateLimitConfig.consume("authorTracks:write", userId);

    Track track =
        trackRepository
            .findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
    verifyOwnership(track, userId);

    packTrackRepository.deleteByTrackId(track.getId());
    trackRepository.delete(track);
  }

  @Transactional
  public void reorderPacks(Long userId, String slug, List<String> packSlugs) {
    rateLimitConfig.consume("authorTracks:write", userId);

    Track track =
        trackRepository
            .findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
    verifyOwnership(track, userId);

    replacePackTracks(track, packSlugs);
    track.setUpdatedAt(Instant.now());
    trackRepository.save(track);
  }

  private void replacePackTracks(Track track, List<String> packSlugs) {
    packTrackRepository.deleteByTrackId(track.getId());
    packTrackRepository.flush();

    for (int i = 0; i < packSlugs.size(); i++) {
      String slug = packSlugs.get(i);
      Pack pack =
          packRepository
              .findBySlug(slug)
              .orElseThrow(() -> new ResourceNotFoundException("Pack not found: " + slug));
      PackTrack pt = new PackTrack();
      pt.setTrack(track);
      pt.setPack(pack);
      pt.setPosition(i + 1);
      packTrackRepository.save(pt);
    }
  }

  private AuthorTrackSummaryResponse toSummary(Track track) {
    List<String> packSlugs = getOrderedPackSlugs(track.getId());
    return new AuthorTrackSummaryResponse(
        track.getId().toString(),
        track.getSlug(),
        track.getTitle(),
        track.getDescription(),
        Arrays.asList(track.getTags()),
        packSlugs,
        packSlugs.size(),
        track.getCreatedAt(),
        track.getUpdatedAt());
  }

  private List<String> getOrderedPackSlugs(Long trackId) {
    return packTrackRepository.findByTrackIdOrderByPositionAsc(trackId).stream()
        .map(pt -> pt.getPack().getSlug())
        .toList();
  }

  private void verifyOwnership(Track track, Long userId) {
    Long authorId = track.getAuthorUser() != null ? track.getAuthorUser().getId() : null;
    if (!userId.equals(authorId)) {
      throw new ForbiddenException("Track not found or not owned by you");
    }
  }
}
