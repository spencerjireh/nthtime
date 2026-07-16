package com.spencerjireh.nthtime.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

/**
 * Exercises the author pack REST surface through the real Spring Security filter chain (session
 * cookie + CSRF), which is where the ATHR ownership/visibility/uniqueness rules are actually
 * enforced -- the Next.js routes are thin proxies. See docs/specs/10-author-web-ui.md.
 */
class AuthorPackControllerIntegrationTest extends AbstractIntegrationTest {

  @Autowired private AppUserRepository appUserRepository;
  @Autowired private PackRepository packRepository;
  @Autowired private ChallengeRepository challengeRepository;
  @Autowired private AttemptRepository attemptRepository;

  private AppUser createUser() {
    return appUserRepository.save(new AppUser());
  }

  private Pack seedPack(AppUser owner, String slug, String visibility) {
    Pack pack = new Pack();
    pack.setName("Seeded " + slug);
    pack.setSlug(slug);
    pack.setDescription("seed");
    pack.setLanguage("javascript");
    pack.setVisibility(visibility);
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

  // ATHR-21
  @Test
  void listRequiresAuthenticationWith401() throws Exception {
    mockMvc.perform(get("/api/author/packs")).andExpect(status().isUnauthorized());
  }

  // ATHR-21
  @Test
  void createRejectsAnAnonymousCaller() throws Exception {
    mockMvc
        .perform(
            post("/api/author/packs")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Anon","slug":"anon-pack","language":"javascript"}"""))
        .andExpect(status().isUnauthorized());
  }

  // ATHR-03
  @Test
  void createPackThenListsIt() throws Exception {
    AppUser user = createUser();

    mockMvc
        .perform(
            post("/api/author/packs")
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"My Pack","slug":"my-pack","description":"d","language":"javascript"}"""))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").exists());

    mockMvc
        .perform(get("/api/author/packs").cookie(sessionCookie(user.getId(), "author-1")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].slug").value("my-pack"))
        .andExpect(jsonPath("$[0].name").value("My Pack"));
  }

  // ATHR-03
  @Test
  void createRejectsADuplicateSlugWith409() throws Exception {
    AppUser user = createUser();
    seedPack(user, "taken-slug", "public");

    mockMvc
        .perform(
            post("/api/author/packs")
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Dupe","slug":"taken-slug","language":"javascript"}"""))
        .andExpect(status().isConflict());
  }

  // ATHR-03
  @Test
  void createRequiresNameSlugAndLanguage() throws Exception {
    AppUser user = createUser();

    mockMvc
        .perform(
            post("/api/author/packs")
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"slug":"missing-name","language":"javascript"}"""))
        .andExpect(status().isBadRequest());
  }

  // ATHR-03
  @Test
  void checkSlugReflectsAvailability() throws Exception {
    AppUser user = createUser();

    mockMvc
        .perform(
            get("/api/author/packs/check-slug")
                .param("slug", "fresh-slug")
                .cookie(sessionCookie(user.getId(), "author-1")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.available").value(true));

    seedPack(user, "fresh-slug", "public");

    mockMvc
        .perform(
            get("/api/author/packs/check-slug")
                .param("slug", "fresh-slug")
                .cookie(sessionCookie(user.getId(), "author-1")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.available").value(false));
  }

  // ATHR-04
  @Test
  void updatePackChangesFields() throws Exception {
    AppUser user = createUser();
    seedPack(user, "edit-me", "public");

    mockMvc
        .perform(
            patch("/api/author/packs/edit-me")
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Renamed","description":"new desc","visibility":"unlisted"}"""))
        .andExpect(status().isOk());

    mockMvc
        .perform(get("/api/author/packs/edit-me").cookie(sessionCookie(user.getId(), "author-1")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Renamed"))
        .andExpect(jsonPath("$.description").value("new desc"))
        .andExpect(jsonPath("$.visibility").value("unlisted"));
  }

  // ATHR-05
  @Test
  void deletePackCascadesChallengesAndAttempts() throws Exception {
    AppUser user = createUser();
    Pack pack = seedPack(user, "doomed", "public");
    Challenge challenge = seedChallenge(pack, "c1", 1);

    Attempt attempt = new Attempt();
    attempt.setUser(user);
    attempt.setChallenge(challenge);
    attempt.setPassed(true);
    attempt.setAssertionResults(Map.of("ok", true));
    attemptRepository.save(attempt);

    mockMvc
        .perform(
            delete("/api/author/packs/doomed")
                .cookie(sessionCookie(user.getId(), "author-1"))
                .with(csrf()))
        .andExpect(status().isOk());

    assertThat(packRepository.findBySlug("doomed")).isEmpty();
    assertThat(challengeRepository.findByPackIdOrderByOrderAsc(pack.getId())).isEmpty();
    assertThat(attemptRepository.findByUserIdAndChallengeId(user.getId(), challenge.getId()))
        .isEmpty();
  }

  // ATHR-06
  @Test
  void privatePacksAreExcludedFromThePublicListButVisibleToTheOwner() throws Exception {
    AppUser user = createUser();
    seedPack(user, "secret-pack", "private");

    assertThat(packRepository.findPublicPacks()).noneMatch(p -> p.getSlug().equals("secret-pack"));

    mockMvc
        .perform(get("/api/author/packs").cookie(sessionCookie(user.getId(), "author-1")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].slug").value("secret-pack"))
        .andExpect(jsonPath("$[0].visibility").value("private"));
  }

  // ATHR-07
  @Test
  void aNonOwnerCannotReadUpdateOrDeleteAnotherAuthorsPack() throws Exception {
    AppUser owner = createUser();
    AppUser intruder = createUser();
    seedPack(owner, "owned", "public");

    mockMvc
        .perform(get("/api/author/packs/owned").cookie(sessionCookie(intruder.getId(), "intruder")))
        .andExpect(status().isForbidden());

    mockMvc
        .perform(
            patch("/api/author/packs/owned")
                .cookie(sessionCookie(intruder.getId(), "intruder"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Hijacked"}"""))
        .andExpect(status().isForbidden());

    mockMvc
        .perform(
            delete("/api/author/packs/owned")
                .cookie(sessionCookie(intruder.getId(), "intruder"))
                .with(csrf()))
        .andExpect(status().isForbidden());

    assertThat(packRepository.findBySlug("owned")).isPresent();
  }

  // ATHR-22
  @Test
  void createIgnoresInjectedOwnershipFields() throws Exception {
    AppUser owner = createUser();
    AppUser other = createUser();

    // CreatePackRequest has no authorUserId/id fields; Spring's Jackson ignores unknown
    // properties, and ownership derives from the session -- so an injected owner id must be
    // ignored and the pack must belong to the caller, not the injected user.
    mockMvc
        .perform(
            post("/api/author/packs")
                .cookie(sessionCookie(owner.getId(), "owner"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    String.format(
                        "{\"name\":\"Injected\",\"slug\":\"inject-test\",\"language\":\"javascript\","
                            + "\"authorUserId\":%d,\"id\":999999}",
                        other.getId())))
        .andExpect(status().isCreated());

    Pack pack = packRepository.findBySlug("inject-test").orElseThrow();
    assertThat(pack.getAuthorUser().getId()).isEqualTo(owner.getId());
  }

  // ATHR-23
  @Test
  void authorWritesAreRateLimited() throws Exception {
    AppUser user = createUser();

    // Bucket capacity for authorPacks:write is 10; the 11th write within the window is rejected.
    for (int i = 0; i < 10; i++) {
      mockMvc
          .perform(
              post("/api/author/packs")
                  .cookie(sessionCookie(user.getId(), "rate-user"))
                  .with(csrf())
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(
                      String.format(
                          "{\"name\":\"P%d\",\"slug\":\"rate-%d\",\"language\":\"javascript\"}",
                          i, i)))
          .andExpect(status().isCreated());
    }

    mockMvc
        .perform(
            post("/api/author/packs")
                .cookie(sessionCookie(user.getId(), "rate-user"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":"Overflow","slug":"rate-overflow","language":"javascript"}"""))
        .andExpect(status().isTooManyRequests());
  }
}
