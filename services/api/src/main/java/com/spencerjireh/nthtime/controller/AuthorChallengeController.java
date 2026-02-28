package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.dto.request.CreateChallengeRequest;
import com.spencerjireh.nthtime.dto.request.ReorderChallengesRequest;
import com.spencerjireh.nthtime.dto.request.UpdateChallengeRequest;
import com.spencerjireh.nthtime.dto.response.AuthorChallengeDetailResponse;
import com.spencerjireh.nthtime.dto.response.AuthorPackDetailResponse;
import com.spencerjireh.nthtime.exception.ForbiddenException;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.service.AuthorChallengeService;
import com.spencerjireh.nthtime.service.AuthorPackService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthorChallengeController {

  private final AuthorChallengeService authorChallengeService;
  private final AuthorPackService authorPackService;

  public AuthorChallengeController(
      AuthorChallengeService authorChallengeService, AuthorPackService authorPackService) {
    this.authorChallengeService = authorChallengeService;
    this.authorPackService = authorPackService;
  }

  @PostMapping("/api/author/packs/{packSlug}/challenges")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> createChallenge(
      @PathVariable String packSlug,
      @Valid @RequestBody CreateChallengeRequest input,
      HttpServletRequest request) {
    Long userId = requireUserId(request);
    Long packId = resolvePackId(userId, packSlug);
    Long id = authorChallengeService.createChallenge(userId, packId, input);
    return Map.of("id", id.toString());
  }

  @PutMapping("/api/author/packs/{packSlug}/challenges/order")
  public Map<String, Boolean> reorderChallenges(
      @PathVariable String packSlug,
      @RequestBody ReorderChallengesRequest input,
      HttpServletRequest request) {
    Long userId = requireUserId(request);
    Long packId = resolvePackId(userId, packSlug);
    List<Long> challengeIds = input.challengeIds().stream().map(Long::parseLong).toList();
    authorChallengeService.reorderChallenges(userId, packId, challengeIds);
    return Map.of("ok", true);
  }

  @GetMapping("/api/author/challenges/{id}")
  public AuthorChallengeDetailResponse getChallenge(
      @PathVariable String id, HttpServletRequest request) {
    Long userId = requireUserId(request);
    AuthorChallengeDetailResponse response =
        authorChallengeService.getChallenge(userId, Long.parseLong(id));
    if (response == null) {
      throw new ResourceNotFoundException("Challenge not found");
    }
    return response;
  }

  @PatchMapping("/api/author/challenges/{id}")
  public Map<String, Boolean> updateChallenge(
      @PathVariable String id,
      @RequestBody UpdateChallengeRequest input,
      HttpServletRequest request) {
    Long userId = requireUserId(request);
    authorChallengeService.updateChallenge(userId, Long.parseLong(id), input);
    return Map.of("ok", true);
  }

  @DeleteMapping("/api/author/challenges/{id}")
  public Map<String, Boolean> removeChallenge(@PathVariable String id, HttpServletRequest request) {
    Long userId = requireUserId(request);
    authorChallengeService.removeChallenge(userId, Long.parseLong(id));
    return Map.of("ok", true);
  }

  private Long resolvePackId(Long userId, String packSlug) {
    AuthorPackDetailResponse pack = authorPackService.getBySlug(userId, packSlug);
    if (pack == null) {
      throw new ResourceNotFoundException("Pack not found");
    }
    return Long.parseLong(pack.id());
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
