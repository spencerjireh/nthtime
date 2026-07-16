package com.spencerjireh.nthtime.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/** Pure unit test for the cache-header logic; no Spring context or Docker required. */
class CacheControlInterceptorTest {

  private final CacheControlInterceptor interceptor = new CacheControlInterceptor();

  private MockHttpServletResponse handle(MockHttpServletRequest request) {
    MockHttpServletResponse response = new MockHttpServletResponse();
    interceptor.preHandle(request, response, new Object());
    return response;
  }

  @Test
  void anonymousCatalogListingIsPubliclyCacheableAndVariesOnCookie() {
    MockHttpServletResponse response = handle(new MockHttpServletRequest("GET", "/api/packs"));

    assertThat(response.getHeader("Cache-Control")).isEqualTo(CacheControlInterceptor.PUBLIC_CACHE);
    assertThat(response.getHeader("Vary")).isEqualTo("Cookie");
  }

  @Test
  void authenticatedCatalogListingIsPrivateAndUncacheable() {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/tracks");
    request.getSession(true).setAttribute("appUserId", 7L);

    MockHttpServletResponse response = handle(request);

    assertThat(response.getHeader("Cache-Control"))
        .isEqualTo(CacheControlInterceptor.PRIVATE_NO_STORE);
  }

  @Test
  void cliEndpointsAreAlwaysPublicEvenWithASession() {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/cli/packs/express");
    request.getSession(true).setAttribute("appUserId", 7L);

    MockHttpServletResponse response = handle(request);

    // CLI responses carry no per-user data, so they stay publicly cacheable regardless of session.
    assertThat(response.getHeader("Cache-Control")).isEqualTo(CacheControlInterceptor.PUBLIC_CACHE);
    assertThat(response.getHeader("Vary")).isNull();
  }

  @Test
  void nonGetRequestsAreLeftUntouched() {
    MockHttpServletResponse response = handle(new MockHttpServletRequest("POST", "/api/packs"));

    assertThat(response.getHeader("Cache-Control")).isNull();
  }
}
