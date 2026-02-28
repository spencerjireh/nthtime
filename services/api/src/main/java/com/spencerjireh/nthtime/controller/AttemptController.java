package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.dto.request.CreateAttemptRequest;
import com.spencerjireh.nthtime.dto.response.AttemptResponse;
import com.spencerjireh.nthtime.exception.ForbiddenException;
import com.spencerjireh.nthtime.service.AttemptService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AttemptController {

  private final AttemptService attemptService;

  public AttemptController(AttemptService attemptService) {
    this.attemptService = attemptService;
  }

  @PostMapping("/api/attempts")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> createAttempt(
      @RequestBody CreateAttemptRequest input, HttpServletRequest request) {
    Long userId = requireUserId(request);
    String id = attemptService.createAttempt(userId, input);
    return Map.of("id", id);
  }

  @GetMapping("/api/challenges/{id}/attempts")
  public List<AttemptResponse> listAttempts(@PathVariable String id, HttpServletRequest request) {
    Long userId = requireUserId(request);
    return attemptService.listAttempts(userId, Long.parseLong(id));
  }

  private Long getUserId(HttpServletRequest request) {
    if (request.getSession(false) == null) return null;
    Object attr = request.getSession().getAttribute("appUserId");
    return attr instanceof Long l ? l : null;
  }

  private Long requireUserId(HttpServletRequest request) {
    Long userId = getUserId(request);
    if (userId == null) throw new ForbiddenException("Not authenticated");
    return userId;
  }
}
