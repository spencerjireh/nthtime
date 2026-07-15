package com.spencerjireh.nthtime.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.spencerjireh.nthtime.AbstractIntegrationTest;
import java.lang.reflect.Field;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

class AuthControllerIntegrationTest extends AbstractIntegrationTest {

  @Autowired private CookieSerializer cookieSerializer;

  /**
   * Spring Session names its cookie "SESSION" unless told otherwise. The Next.js proxy, the
   * server-side API client and SecurityConfig.deleteCookies all speak "JSESSIONID" -- if these ever
   * drift apart the browser's session stops reaching this service and every authenticated request
   * silently becomes anonymous.
   */
  @Test
  void sessionCookieIsNamedJsessionid() throws Exception {
    Field field = DefaultCookieSerializer.class.getDeclaredField("cookieName");
    field.setAccessible(true);
    assertThat(field.get(cookieSerializer)).isEqualTo("JSESSIONID");
  }

  @Test
  void sessionReportsUnauthenticatedForAnonymousCaller() throws Exception {
    mockMvc
        .perform(get("/api/auth/session"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.authenticated").value(false));
  }

  @Test
  void sessionReportsAuthenticatedWhenTheSessionCarriesAUserId() throws Exception {
    mockMvc
        .perform(get("/api/auth/session").cookie(sessionCookie(42L, "spencerjireh")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.authenticated").value(true))
        .andExpect(jsonPath("$.userId").value("42"));
  }

  @Test
  void logoutIsRejectedWithoutACsrfToken() throws Exception {
    mockMvc
        .perform(post("/api/auth/logout").cookie(sessionCookie(42L, "spencerjireh")))
        .andExpect(status().isForbidden());
  }

  @Test
  void logoutReturns204WithACsrfToken() throws Exception {
    mockMvc
        .perform(post("/api/auth/logout").cookie(sessionCookie(42L, "spencerjireh")).with(csrf()))
        .andExpect(status().isNoContent());
  }

  @Test
  void logoutIsNotReachableByGet() throws Exception {
    // The old sign-out route was a GET, so a prefetch or an <img> tag could end a
    // visitor's session.
    mockMvc
        .perform(get("/api/auth/logout").cookie(sessionCookie(42L, "spencerjireh")))
        .andExpect(status().is4xxClientError());
  }
}
