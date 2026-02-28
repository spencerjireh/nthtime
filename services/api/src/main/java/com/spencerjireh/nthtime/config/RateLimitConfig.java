package com.spencerjireh.nthtime.config;

import com.spencerjireh.nthtime.exception.RateLimitExceededException;
import io.bucket4j.Bandwidth;
import io.bucket4j.Bucket;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class RateLimitConfig {

  private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

  public void consume(String operation, Long userId) {
    String key = operation + ":" + userId;
    Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket(operation));
    if (!bucket.tryConsume(1)) {
      throw new RateLimitExceededException("Rate limit exceeded for " + operation);
    }
  }

  private Bucket createBucket(String operation) {
    return switch (operation) {
      case "attempts:create" ->
          Bucket.builder()
              .addLimit(
                  Bandwidth.builder().capacity(3).refillGreedy(10, Duration.ofMinutes(1)).build())
              .build();
      case "settings:update" ->
          Bucket.builder()
              .addLimit(
                  Bandwidth.builder().capacity(5).refillGreedy(20, Duration.ofMinutes(1)).build())
              .build();
      case "authorPacks:write", "authorChallenges:write" ->
          Bucket.builder()
              .addLimit(
                  Bandwidth.builder().capacity(10).refillGreedy(30, Duration.ofMinutes(1)).build())
              .build();
      default -> throw new IllegalArgumentException("Unknown rate limit: " + operation);
    };
  }
}
