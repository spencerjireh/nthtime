package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.dto.response.SessionResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  @GetMapping("/session")
  public SessionResponse getSession(HttpServletRequest request) {
    Long appUserId = getUserId(request);
    if (appUserId == null) {
      return new SessionResponse(false, null);
    }
    return new SessionResponse(true, appUserId.toString());
  }

  private Long getUserId(HttpServletRequest request) {
    if (request.getSession(false) == null) return null;
    Object attr = request.getSession().getAttribute("appUserId");
    return attr instanceof Long l ? l : null;
  }
}
