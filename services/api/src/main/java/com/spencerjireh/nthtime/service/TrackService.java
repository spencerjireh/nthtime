package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.response.CliTrackDetailResponse;
import com.spencerjireh.nthtime.dto.response.CliTrackSummaryResponse;
import com.spencerjireh.nthtime.dto.response.TrackDetailResponse;
import com.spencerjireh.nthtime.dto.response.TrackSummaryResponse;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.entity.PackTrack;
import com.spencerjireh.nthtime.entity.Track;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import com.spencerjireh.nthtime.repository.PackTrackRepository;
import com.spencerjireh.nthtime.repository.TrackRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TrackService {

  private final TrackRepository trackRepository;
  private final PackTrackRepository packTrackRepository;
  private final ChallengeRepository challengeRepository;
  private final AttemptRepository attemptRepository;

  public TrackService(
      TrackRepository trackRepository,
      PackTrackRepository packTrackRepository,
      ChallengeRepository challengeRepository,
      AttemptRepository attemptRepository) {
    this.trackRepository = trackRepository;
    this.packTrackRepository = packTrackRepository;
    this.challengeRepository = challengeRepository;
    this.attemptRepository = attemptRepository;
  }

  public List<TrackSummaryResponse> listTracks() {
    List<Track> tracks = trackRepository.findAll();
    return tracks.stream()
        .map(
            track -> {
              int packCount =
                  packTrackRepository.findByTrackIdOrderByPositionAsc(track.getId()).size();
              return new TrackSummaryResponse(
                  track.getId().toString(),
                  track.getSlug(),
                  track.getTitle(),
                  track.getDescription(),
                  Arrays.asList(track.getTags()),
                  packCount);
            })
        .toList();
  }

  public TrackDetailResponse getTrack(String slug, Long userId) {
    Track track = trackRepository.findBySlug(slug).orElse(null);
    if (track == null) return null;

    List<PackTrack> packTracks = packTrackRepository.findByTrackIdOrderByPositionAsc(track.getId());

    Set<Long> passedChallengeIds =
        userId != null ? attemptRepository.findPassedChallengeIdsByUserId(userId) : Set.of();

    List<TrackDetailResponse.TrackPackEntry> packs =
        packTracks.stream()
            .map(
                pt -> {
                  Pack pack = pt.getPack();
                  int challengeCount = challengeRepository.countByPackId(pack.getId());
                  long passedCount =
                      challengeRepository.findByPackIdOrderByOrderAsc(pack.getId()).stream()
                          .filter(c -> passedChallengeIds.contains(c.getId()))
                          .count();

                  return new TrackDetailResponse.TrackPackEntry(
                      pack.getId().toString(),
                      pack.getSlug(),
                      pack.getName(),
                      pack.getDescription(),
                      pack.getLanguage(),
                      pack.getFramework(),
                      pack.getTags(),
                      challengeCount,
                      (int) passedCount);
                })
            .toList();

    return new TrackDetailResponse(
        track.getId().toString(),
        track.getSlug(),
        track.getTitle(),
        track.getDescription(),
        track.getLongDescription(),
        Arrays.asList(track.getTags()),
        packs);
  }

  public List<CliTrackSummaryResponse> listTracksForCli() {
    List<Track> tracks = trackRepository.findAll();
    return tracks.stream()
        .map(
            track -> {
              int packCount =
                  packTrackRepository.findByTrackIdOrderByPositionAsc(track.getId()).size();
              return new CliTrackSummaryResponse(
                  track.getSlug(), track.getTitle(), track.getDescription(), packCount);
            })
        .toList();
  }

  public CliTrackDetailResponse getTrackForCli(String slug) {
    Track track = trackRepository.findBySlug(slug).orElse(null);
    if (track == null) return null;

    List<PackTrack> packTracks = packTrackRepository.findByTrackIdOrderByPositionAsc(track.getId());

    List<CliTrackDetailResponse.CliTrackPack> packs =
        packTracks.stream()
            .map(
                pt ->
                    new CliTrackDetailResponse.CliTrackPack(
                        pt.getPack().getSlug(), pt.getPack().getName(), pt.getPosition()))
            .toList();

    return new CliTrackDetailResponse(
        track.getSlug(), track.getTitle(), track.getDescription(), packs);
  }
}
