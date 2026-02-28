package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.request.SeedPackRequest;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import com.spencerjireh.nthtime.repository.PackRepository;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

  private final PackRepository packRepository;
  private final ChallengeRepository challengeRepository;
  private final AttemptRepository attemptRepository;

  public AdminService(
      PackRepository packRepository,
      ChallengeRepository challengeRepository,
      AttemptRepository attemptRepository) {
    this.packRepository = packRepository;
    this.challengeRepository = challengeRepository;
    this.attemptRepository = attemptRepository;
  }

  @Transactional
  public void seedPack(SeedPackRequest input) {
    upsertPack(input);
  }

  @Transactional
  public void syncPacks(List<SeedPackRequest> packs) {
    Set<String> syncedSlugs = new HashSet<>();
    for (SeedPackRequest pack : packs) {
      upsertPack(pack);
      syncedSlugs.add(pack.slug());
    }

    // Delete system-seeded packs not in the sync list
    // Only delete packs without an authorUserId (system-seeded packs)
    List<Pack> allPacks = packRepository.findAll();
    for (Pack pack : allPacks) {
      if (pack.getAuthorUser() == null && !syncedSlugs.contains(pack.getSlug())) {
        List<Challenge> challenges = challengeRepository.findByPackIdOrderByOrderAsc(pack.getId());
        for (Challenge challenge : challenges) {
          attemptRepository.deleteByChallengeId(challenge.getId());
        }
        challengeRepository.deleteAllByPackId(pack.getId());
        packRepository.delete(pack);
      }
    }
  }

  private void upsertPack(SeedPackRequest input) {
    Pack pack = packRepository.findBySlug(input.slug()).orElse(null);

    if (pack == null) {
      pack = new Pack();
      pack.setSlug(input.slug());
      pack.setCreatedAt(Instant.now());
    }

    pack.setName(input.name());
    pack.setDescription(input.description() != null ? input.description() : "");
    pack.setLanguage(input.language());
    pack.setFramework(input.framework());
    pack.setVersion(input.version() != null ? input.version() : "1.0.0");
    pack.setAuthor(input.author() != null ? input.author() : "");
    pack.setTags(input.tags() != null ? input.tags().toArray(new String[0]) : new String[] {});
    pack.setUpdatedAt(Instant.now());
    pack = packRepository.save(pack);

    // Delete existing challenges for this pack
    List<Challenge> existing = challengeRepository.findByPackIdOrderByOrderAsc(pack.getId());
    for (Challenge c : existing) {
      attemptRepository.deleteByChallengeId(c.getId());
    }
    challengeRepository.deleteAllByPackId(pack.getId());
    challengeRepository.flush();

    // Insert new challenges with order
    if (input.challenges() != null) {
      for (int i = 0; i < input.challenges().size(); i++) {
        var c = input.challenges().get(i);
        Challenge challenge = new Challenge();
        challenge.setPack(pack);
        challenge.setSlug(c.slug());
        challenge.setTitle(c.title());
        challenge.setPrompt(c.prompt() != null ? c.prompt() : "");
        challenge.setDifficulty(c.difficulty() != null ? c.difficulty() : "beginner");
        challenge.setTags(c.tags() != null ? c.tags().toArray(new String[0]) : new String[] {});
        challenge.setTimeEstimateSeconds(c.timeEstimateSeconds());
        challenge.setHints(c.hints() != null ? c.hints().toArray(new String[0]) : new String[] {});
        challenge.setAssertions(c.assertions());
        challenge.setReferenceSolution(c.referenceSolution());
        challenge.setOrder(i + 1);
        challengeRepository.save(challenge);
      }
    }
  }
}
