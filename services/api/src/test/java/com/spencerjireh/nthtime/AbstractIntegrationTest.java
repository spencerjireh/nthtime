package com.spencerjireh.nthtime;

import jakarta.servlet.http.Cookie;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base for tests that need the real Spring Security filter chain -- CSRF enforcement, 401 vs 403,
 * and logout method handling -- rather than a controller in isolation.
 *
 * <p>The Postgres container is static and started once for the whole suite; a per-class container
 * would boot a fresh database for every test class.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

  static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

  static {
    POSTGRES.start();
  }

  @DynamicPropertySource
  static void configureProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
  }

  @Autowired protected MockMvc mockMvc;

  @Autowired protected SessionRepository<? extends Session> sessionRepository;

  /**
   * Builds a real Spring Session and returns the cookie that addresses it.
   *
   * <p>MockMvc's {@code .sessionAttr(...)} and {@code .with(user(...))} are useless here: Spring
   * Session's {@code SessionRepositoryFilter} wraps the request with its own JDBC-backed
   * HttpSession and ignores the MockHttpSession those helpers populate. The session has to exist in
   * the repository and be addressed by cookie, exactly as a browser would.
   */
  protected Cookie sessionCookie(Long userId, String principalName) {
    Session session = sessionRepository.createSession();
    session.setAttribute("appUserId", userId);

    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(
        new UsernamePasswordAuthenticationToken(
            principalName, "n/a", List.of(new SimpleGrantedAuthority("ROLE_USER"))));
    session.setAttribute("SPRING_SECURITY_CONTEXT", context);

    saveSession(session);

    // DefaultCookieSerializer base64-encodes the session id by default.
    String value =
        Base64.getEncoder().encodeToString(session.getId().getBytes(StandardCharsets.UTF_8));
    return new Cookie("JSESSIONID", value);
  }

  @SuppressWarnings("unchecked")
  private void saveSession(Session session) {
    ((SessionRepository<Session>) sessionRepository).save(session);
  }
}
