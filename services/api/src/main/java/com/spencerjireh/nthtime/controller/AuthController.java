package com.spencerjireh.nthtime.controller;

import static com.spencerjireh.nthtime.util.SessionUtils.getUserId;

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
}
