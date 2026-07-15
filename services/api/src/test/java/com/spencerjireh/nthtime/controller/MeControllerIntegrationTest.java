package com.spencerjireh.nthtime.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.spencerjireh.nthtime.AbstractIntegrationTest;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.entity.AuthAccount;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import com.spencerjireh.nthtime.repository.AuthAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class MeControllerIntegrationTest extends AbstractIntegrationTest {

  @Autowired private AppUserRepository appUserRepository;
  @Autowired private AuthAccountRepository authAccountRepository;

  private AppUser createUser(String handle, String email) {
    AppUser user = appUserRepository.save(new AppUser());
    AuthAccount account = new AuthAccount();
    account.setUser(user);
    account.setProvider("github");
    account.setProviderAccountId(handle);
    account.setName("Test User");
    account.setEmail(email);
    account.setImage("https://avatars.githubusercontent.com/u/1?v=4");
    authAccountRepository.save(account);
    return user;
  }

  @Test
  void profileRequiresAuthenticationWith401() throws Exception {
    mockMvc.perform(get("/api/me/profile")).andExpect(status().isUnauthorized());
  }

  @Test
  void profileReturnsTheLinkedAccount() throws Exception {
    AppUser user = createUser("profile-user", "profile@example.com");

    mockMvc
        .perform(get("/api/me/profile").cookie(sessionCookie(user.getId(), "profile-user")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.userId").value(user.getId().toString()))
        .andExpect(jsonPath("$.handle").value("profile-user"))
        .andExpect(jsonPath("$.provider").value("github"))
        .andExpect(jsonPath("$.name").value("Test User"))
        .andExpect(jsonPath("$.createdAt").exists());
  }

  @Test
  void profileOmitsAnAbsentEmail() throws Exception {
    AppUser user = createUser("no-email-user", null);

    // Jackson is configured with non_null inclusion, so a GitHub user with a hidden
    // email yields an absent field rather than null. The TS type models it optional.
    mockMvc
        .perform(get("/api/me/profile").cookie(sessionCookie(user.getId(), "no-email-user")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").doesNotExist());
  }

  @Test
  void deleteAccountIsRejectedWithoutACsrfToken() throws Exception {
    AppUser user = createUser("csrf-user", "csrf@example.com");

    mockMvc
        .perform(delete("/api/me").cookie(sessionCookie(user.getId(), "csrf-user")))
        .andExpect(status().isForbidden());

    assertThat(appUserRepository.findById(user.getId())).isPresent();
  }

  @Test
  void deleteAccountRejectsAnAnonymousCaller() throws Exception {
    // CSRF is checked ahead of authorization, so the token has to be present for the
    // 401 to be the thing under test.
    mockMvc.perform(delete("/api/me").with(csrf())).andExpect(status().isUnauthorized());
  }

  @Test
  void deleteAccountRemovesTheUserAndCascadesTheLinkedAccount() throws Exception {
    AppUser user = createUser("delete-me", "delete@example.com");
    Long userId = user.getId();

    mockMvc
        .perform(delete("/api/me").cookie(sessionCookie(userId, "delete-me")).with(csrf()))
        .andExpect(status().isNoContent());

    assertThat(appUserRepository.findById(userId)).isEmpty();
    assertThat(authAccountRepository.findByProviderAndProviderAccountId("github", "delete-me"))
        .isEmpty();
  }
}
