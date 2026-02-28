package com.spencerjireh.nthtime.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Value("${nthtime.frontend-url}")
  private String frontendUrl;

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http, OAuth2AuthenticationSuccessHandler successHandler) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsSource()))
        .authorizeHttpRequests(
            auth ->
                auth
                    // Public endpoints
                    .requestMatchers("/api/packs/**")
                    .permitAll()
                    .requestMatchers("/api/challenges/**")
                    .permitAll()
                    .requestMatchers("/api/search/**")
                    .permitAll()
                    .requestMatchers("/api/cli/**")
                    .permitAll()
                    .requestMatchers("/api/health")
                    .permitAll()
                    .requestMatchers("/api/admin/**")
                    .permitAll()
                    .requestMatchers("/api/auth/session")
                    .permitAll()
                    .requestMatchers("/api-docs/**", "/swagger-ui/**")
                    .permitAll()
                    .requestMatchers("/actuator/**")
                    .permitAll()
                    // OAuth2 flow endpoints
                    .requestMatchers("/oauth2/**", "/login/**")
                    .permitAll()
                    // Everything else requires auth
                    .anyRequest()
                    .authenticated())
        .oauth2Login(
            oauth ->
                oauth
                    .successHandler(successHandler)
                    .failureHandler(
                        (req, res, ex) -> res.sendRedirect(frontendUrl + "/?auth_error=1")))
        .logout(
            logout ->
                logout
                    .logoutUrl("/api/auth/logout")
                    .logoutSuccessUrl(frontendUrl)
                    .deleteCookies("JSESSIONID"))
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .exceptionHandling(
            ex ->
                ex.authenticationEntryPoint(
                    (req, res, authEx) -> {
                      res.setContentType("application/json");
                      res.setStatus(401);
                      res.getWriter().write("{\"error\":\"Not authenticated\"}");
                    }));

    return http.build();
  }

  private CorsConfigurationSource corsSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(frontendUrl, "http://web:3000"));
    config.setAllowedMethods(List.of("*"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
