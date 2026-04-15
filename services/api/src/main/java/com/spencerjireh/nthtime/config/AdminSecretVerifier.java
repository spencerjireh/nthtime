package com.spencerjireh.nthtime.config;

import com.spencerjireh.nthtime.exception.ForbiddenException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AdminSecretVerifier {

  private final String adminSecret;

  public AdminSecretVerifier(@Value("${nthtime.admin-secret}") String adminSecret) {
    this.adminSecret = adminSecret;
  }

  public void verify(String provided) {
    if (provided == null
        || !MessageDigest.isEqual(
            provided.getBytes(StandardCharsets.UTF_8),
            adminSecret.getBytes(StandardCharsets.UTF_8))) {
      throw new ForbiddenException("Invalid admin secret");
    }
  }
}
