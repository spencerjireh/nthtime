package com.spencerjireh.nthtime.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Registers the {@link CacheControlInterceptor} on the public, cacheable catalog paths. */
@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final CacheControlInterceptor cacheControlInterceptor;

  public WebConfig(CacheControlInterceptor cacheControlInterceptor) {
    this.cacheControlInterceptor = cacheControlInterceptor;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(cacheControlInterceptor)
        .addPathPatterns("/api/packs/**", "/api/tracks/**", "/api/challenges/**", "/api/cli/**");
  }
}
