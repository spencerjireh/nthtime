package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.response.ChallengeSummaryResponse;
import com.spencerjireh.nthtime.dto.response.PackChallengesResponse;
import com.spencerjireh.nthtime.dto.response.PackListResponse;
import com.spencerjireh.nthtime.dto.response.PackSummaryResponse;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import com.spencerjireh.nthtime.repository.PackRepository;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PackService {

  private final PackRepository packRepository;
  private final ChallengeRepository challengeRepository;
  private final AttemptRepository attemptRepository;

  public PackService(
      PackRepository packRepository,
      ChallengeRepository challengeRepository,
      AttemptRepository attemptRepository) {
    this.packRepository = packRepository;
    this.challengeRepository = challengeRepository;
    this.attemptRepository = attemptRepository;
  }

  public PackListResponse listPacks(
      String language, String difficulty, List<String> tags, Long userId) {
    List<Pack> packs =
        userId != null ? packRepository.findVisiblePacks(userId) : packRepository.findPublicPacks();

    Set<Long> passedChallengeIds =
        userId != null ? attemptRepository.findPassedChallengeIdsByUserId(userId) : Set.of();

    Set<String> allTags = new TreeSet<>();

    List<PackSummaryResponse> summaries =
        packs.stream()
            .map(
                pack -> {
                  allTags.addAll(Arrays.asList(pack.getTags()));
                  List<Challenge> challenges =
                      challengeRepository.findByPackIdOrderByOrderAsc(pack.getId());

                  // Apply difficulty filter at challenge level
                  if (difficulty != null && !difficulty.isBlank()) {
                    challenges =
                        challenges.stream()
                            .filter(c -> c.getDifficulty().equals(difficulty))
                            .toList();
                  }

                  long passedCount =
                      challenges.stream()
                          .filter(c -> passedChallengeIds.contains(c.getId()))
                          .count();

                  return new PackSummaryResponse(
                      pack.getId().toString(),
                      pack.getName(),
                      pack.getSlug(),
                      pack.getDescription(),
                      pack.getLanguage(),
                      pack.getFramework(),
                      pack.getVersion(),
                      pack.getAuthor(),
                      pack.getTags(),
                      challenges.size(),
                      (int) passedCount,
                      pack.getVisibility());
                })
            .toList();

    // Apply language filter
    if (language != null && !language.isBlank()) {
      summaries = summaries.stream().filter(s -> s.language().equals(language)).toList();
    }

    // Apply tags filter (ANY match)
    if (tags != null && !tags.isEmpty()) {
      Set<String> tagFilter = new HashSet<>(tags);
      summaries =
          summaries.stream()
              .filter(s -> Arrays.stream(s.tags()).anyMatch(tagFilter::contains))
              .toList();
    }

    return new PackListResponse(summaries, List.copyOf(allTags));
  }

  public PackChallengesResponse getChallenges(String slug, Long userId) {
    Pack pack = packRepository.findBySlug(slug).orElse(null);
    if (pack == null) return null;

    String vis = pack.getVisibility();
    if ("private".equals(vis)) {
      if (userId == null) return null;
      Long authorId = pack.getAuthorUser() != null ? pack.getAuthorUser().getId() : null;
      if (!userId.equals(authorId)) return null;
    }

    List<Challenge> challenges = challengeRepository.findByPackIdOrderByOrderAsc(pack.getId());

    // Build status map for authenticated user
    Map<Long, String> statusMap = new HashMap<>();
    if (userId != null) {
      List<Object[]> statuses = attemptRepository.findChallengeStatusesByUserId(userId);
      for (Object[] row : statuses) {
        Long challengeId = (Long) row[0];
        boolean passed = (boolean) row[1];
        if (passed) {
          statusMap.put(challengeId, "passed");
        } else {
          statusMap.putIfAbsent(challengeId, "failed");
        }
      }
    }

    List<ChallengeSummaryResponse> summaries =
        challenges.stream()
            .map(
                c -> {
                  String status = statusMap.getOrDefault(c.getId(), "not-attempted");
                  return new ChallengeSummaryResponse(
                      c.getId().toString(),
                      c.getSlug(),
                      c.getTitle(),
                      c.getDifficulty(),
                      c.getTags(),
                      c.getTimeEstimateSeconds(),
                      c.getOrder(),
                      status);
                })
            .toList();

    var packDetail =
        new PackChallengesResponse.PackDetail(
            pack.getId().toString(),
            pack.getName(),
            pack.getSlug(),
            pack.getDescription(),
            pack.getLanguage(),
            pack.getFramework(),
            pack.getTags());

    return new PackChallengesResponse(packDetail, summaries);
  }
}
