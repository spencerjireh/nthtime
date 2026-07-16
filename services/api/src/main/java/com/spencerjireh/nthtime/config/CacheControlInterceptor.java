package com.spencerjireh.nthtime.config;

import com.spencerjireh.nthtime.util.SessionUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Sets {@code Cache-Control} on read-only catalog responses so a CDN and the browser can cache
 * anonymous traffic, while personalized responses stay private.
 *
 * <p>{@code /api/cli/**} and {@code /api/challenges/**} carry no per-user data and are always
 * publicly cacheable. {@code /api/packs/**} and {@code /api/tracks/**} fold per-user completion
 * progress into the same URL, so they are only cacheable for anonymous callers; authenticated
 * responses are marked {@code private, no-store}. {@code Vary: Cookie} keeps shared caches from
 * serving an anonymous body to a signed-in user (belt-and-suspenders alongside the CDN's
 * cookie-bypass rule -- see docs/operations/cloudflare-cdn.md).
 */
@Component
public class CacheControlInterceptor implements HandlerInterceptor {

  static final String PUBLIC_CACHE = "public, s-maxage=300, stale-while-revalidate=60";
  static final String PRIVATE_NO_STORE = "private, no-store";

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    if (!"GET".equalsIgnoreCase(request.getMethod())) {
      return true;
    }

    String path = request.getRequestURI();
    boolean personalized = path.startsWith("/api/packs") || path.startsWith("/api/tracks");

    if (personalized) {
      response.setHeader(HttpHeaders.VARY, "Cookie");
      response.setHeader(
          HttpHeaders.CACHE_CONTROL,
          SessionUtils.getUserId(request) != null ? PRIVATE_NO_STORE : PUBLIC_CACHE);
    } else {
      response.setHeader(HttpHeaders.CACHE_CONTROL, PUBLIC_CACHE);
    }
    return true;
  }
}
