package com.spencerjireh.nthtime.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.spencerjireh.nthtime.AbstractIntegrationTest;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.Attempt;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.entity.Pack;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AttemptRepository;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import com.spencerjireh.nthtime.repository.PackRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

/**
 * Exercises the author challenge REST surface (create/update/delete/reorder) through the real
 * Spring Security filter chain, covering the ATHR ownership, attempt-invalidation, and renumbering
 * rules enforced server-side. See docs/specs/10-author-web-ui.md.
 */
class AuthorChallengeControllerIntegrationTest extends AbstractIntegrationTest {

  @Autowired private AppUserRepository appUserRepository;
  @Autowired private PackRepository packRepository;
  @Autowired private ChallengeRepository challengeRepository;
  @Autowired private AttemptRepository attemptRepository;

  private AppUser createUser() {
    return appUserRepository.save(new AppUser());
  }

  private Pack seedPack(AppUser owner, String slug) {
    Pack pack = new Pack();
    pack.setName("Seeded " + slug);
    pack.setSlug(slug);
    pack.setDescription("seed");
    pack.setLanguage("javascript");
    pack.setVisibility("public");
    pack.setAuthorUser(owner);
    return packRepository.save(pack);
  }

  private Challenge seedChallenge(Pack pack, String slug, int order) {
    Challenge challenge = new Challenge();
    challenge.setPack(pack);
    challenge.setSlug(slug);
    challenge.setTitle("Seeded " + slug);
    challenge.setDifficulty("beginner");
    challenge.setTimeEstimateSeconds(300);
    challenge.setAssertions(Map.of());
    challenge.setReferenceSolution(Map.of());
    challenge.setOrder(order);
    return challengeRepository.save(challenge);
  }

  private List<Integer> ordersFor(Long packId) {
    return challengeRepository.findByPackIdOrderByOrderAsc(packId).stream()
        .map(Challenge::getOrder)
        .toList();
  }

  // ATHR-21
  @Test
  void createChallengeRejectsAnAnonymousCaller() throws Exception {
    AppUser user = createUser();
    seedPack(user, "anon-pack");

    mockMvc
        .perform(
            post("/api/author/packs/anon-pack/challenges")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"slug":"c1","title":"C1","assertions":{},"referenceSolution":{}}"""))
        .andExpect(status().isUnauthorized());
  }

  // ATHR-08
  @Test
  void createChallengeThenGetById() throws Exception {
    AppUser user = createUser();
    seedPack(user, "pack-a");

    String body =
        mockMvc
            .perform(
                post("/api/author/packs/pack-a/challenges")
                    .cookie(sessionCookie(user.getId(), "author-1"))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"slug":"hello","title":"Hello","prompt":"Do it","difficulty":"beginner",
                         "timeEstimateSeconds":300,"assertions":{},"referenceSolution":{}}"""))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

    String id = body.replaceAll(".*\"id\"\\s*:\\s*\"(\\d+)\".*", "$1");

    mockMvc
        .perform(
            get("/api/author/challenges/" + id).cookie(sessionCookie(user.getId(), "author-1")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.slug").value("hello"))
        .andExpect(jsonPath("$.title").value("Hello"))
        .andExpect(jsonPath("$.order").value(1));
  }

  // ATHR-08
  @Test
  void createChallengeRequiresSlugAndTitle() throws Exception {
    AppUser user = createUser();
    seedPack(user, "pack-b");

    mockMvc
        .perform(
            post("/api/author/packs/pack-b/challenges")
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"slug":"no-title","assertions":{},"referenceSolution":{}}"""))
        .andExpect(status().isBadRequest());
  }

  // ATHR-09
  @Test
  void updatePreservesUnmodifiedFields() throws Exception {
    AppUser user = createUser();
    Pack pack = seedPack(user, "pack-c");
    Challenge challenge = seedChallenge(pack, "orig", 1);

    // PATCH only the prompt; title and difficulty must be preserved.
    mockMvc
        .perform(
            patch("/api/author/challenges/" + challenge.getId())
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"prompt":"Updated prompt"}"""))
        .andExpect(status().isOk());

    Challenge reloaded = challengeRepository.findById(challenge.getId()).orElseThrow();
    assertThat(reloaded.getPrompt()).isEqualTo("Updated prompt");
    assertThat(reloaded.getTitle()).isEqualTo("Seeded orig");
    assertThat(reloaded.getDifficulty()).isEqualTo("beginner");
  }

  // ATHR-10
  @Test
  void updateDeletesExistingAttempts() throws Exception {
    AppUser user = createUser();
    Pack pack = seedPack(user, "pack-d");
    Challenge challenge = seedChallenge(pack, "graded", 1);

    Attempt attempt = new Attempt();
    attempt.setUser(user);
    attempt.setChallenge(challenge);
    attempt.setPassed(true);
    attempt.setAssertionResults(Map.of("ok", true));
    attemptRepository.save(attempt);
    assertThat(attemptRepository.findByUserIdAndChallengeId(user.getId(), challenge.getId()))
        .isNotEmpty();

    mockMvc
        .perform(
            patch("/api/author/challenges/" + challenge.getId())
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"assertions":{"changed":true}}"""))
        .andExpect(status().isOk());

    assertThat(attemptRepository.findByUserIdAndChallengeId(user.getId(), challenge.getId()))
        .isEmpty();
  }

  // ATHR-11
  @Test
  void deleteRenumbersRemainingChallenges() throws Exception {
    AppUser user = createUser();
    Pack pack = seedPack(user, "pack-e");
    seedChallenge(pack, "first", 1);
    Challenge middle = seedChallenge(pack, "second", 2);
    seedChallenge(pack, "third", 3);

    mockMvc
        .perform(
            delete("/api/author/challenges/" + middle.getId())
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf()))
        .andExpect(status().isOk());

    // The remaining two challenges keep a contiguous 1..N order with no gap.
    assertThat(ordersFor(pack.getId())).containsExactly(1, 2);
    assertThat(challengeRepository.findByPackIdAndSlug(pack.getId(), "second")).isEmpty();
  }

  // ATHR-12
  @Test
  void reorderUpdatesOrderFields() throws Exception {
    AppUser user = createUser();
    Pack pack = seedPack(user, "pack-f");
    Challenge a = seedChallenge(pack, "a", 1);
    Challenge b = seedChallenge(pack, "b", 2);
    Challenge c = seedChallenge(pack, "c", 3);

    // Reverse the order: c, b, a -> orders 1, 2, 3 respectively.
    mockMvc
        .perform(
            put("/api/author/packs/pack-f/challenges/order")
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    String.format(
                        "{\"challengeIds\":[\"%d\",\"%d\",\"%d\"]}",
                        c.getId(), b.getId(), a.getId())))
        .andExpect(status().isOk());

    assertThat(challengeRepository.findById(c.getId()).orElseThrow().getOrder()).isEqualTo(1);
    assertThat(challengeRepository.findById(b.getId()).orElseThrow().getOrder()).isEqualTo(2);
    assertThat(challengeRepository.findById(a.getId()).orElseThrow().getOrder()).isEqualTo(3);
  }

  // ATHR-07
  @Test
  void aNonOwnerCannotReadUpdateOrDeleteAChallenge() throws Exception {
    AppUser owner = createUser();
    AppUser intruder = createUser();
    Pack pack = seedPack(owner, "pack-g");
    Challenge challenge = seedChallenge(pack, "guarded", 1);

    mockMvc
        .perform(
            get("/api/author/challenges/" + challenge.getId())
                .cookie(sessionCookie(intruder.getId(), "intruder")))
        .andExpect(status().isForbidden());

    mockMvc
        .perform(
            patch("/api/author/challenges/" + challenge.getId())
                .cookie(sessionCookie(intruder.getId(), "intruder"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"title":"Hijacked"}"""))
        .andExpect(status().isForbidden());

    mockMvc
        .perform(
            delete("/api/author/challenges/" + challenge.getId())
                .cookie(sessionCookie(intruder.getId(), "intruder"))
                .with(csrf()))
        .andExpect(status().isForbidden());

    assertThat(challengeRepository.findById(challenge.getId())).isPresent();
  }
}
