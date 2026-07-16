package com.spencerjireh.nthtime.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.spencerjireh.nthtime.AbstractIntegrationTest;
import com.spencerjireh.nthtime.entity.AppUser;
import com.spencerjireh.nthtime.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Confirms the {@link CacheControlInterceptor} is actually registered by {@link WebConfig} on the
 * real MVC chain and emits the expected headers on live catalog responses (not just in isolation).
 */
class CacheControlIntegrationTest extends AbstractIntegrationTest {

  @Autowired private AppUserRepository appUserRepository;

  @Test
  void anonymousCatalogListingGetsPublicCacheHeaders() throws Exception {
    mockMvc
        .perform(get("/api/packs"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", CacheControlInterceptor.PUBLIC_CACHE))
        .andExpect(header().string("Vary", "Cookie"));
  }

  @Test
  void cliEndpointGetsPublicCacheHeaders() throws Exception {
    mockMvc
        .perform(get("/api/cli/tracks"))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", CacheControlInterceptor.PUBLIC_CACHE));
  }

  @Test
  void authenticatedCatalogListingIsPrivate() throws Exception {
    AppUser user = appUserRepository.save(new AppUser());

    mockMvc
        .perform(get("/api/packs").cookie(sessionCookie(user.getId(), "cache-user")))
        .andExpect(status().isOk())
        .andExpect(header().string("Cache-Control", CacheControlInterceptor.PRIVATE_NO_STORE));
  }
}
