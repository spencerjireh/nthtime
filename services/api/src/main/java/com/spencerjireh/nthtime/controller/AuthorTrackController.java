package com.spencerjireh.nthtime.controller;

import static com.spencerjireh.nthtime.util.SessionUtils.requireUserId;

import com.spencerjireh.nthtime.dto.request.CreateTrackRequest;
import com.spencerjireh.nthtime.dto.request.ReorderTrackPacksRequest;
import com.spencerjireh.nthtime.dto.request.UpdateTrackRequest;
import com.spencerjireh.nthtime.dto.response.AuthorTrackDetailResponse;
import com.spencerjireh.nthtime.dto.response.AuthorTrackSummaryResponse;
import com.spencerjireh.nthtime.service.AuthorTrackService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/author/tracks")
public class AuthorTrackController {

  private final AuthorTrackService authorTrackService;

  public AuthorTrackController(AuthorTrackService authorTrackService) {
    this.authorTrackService = authorTrackService;
  }

  @GetMapping
  public List<AuthorTrackSummaryResponse> myTracks(HttpServletRequest request) {
    Long userId = requireUserId(request);
    return authorTrackService.myTracks(userId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> createTrack(
      @Valid @RequestBody CreateTrackRequest input, HttpServletRequest request) {
    Long userId = requireUserId(request);
    Long id = authorTrackService.createTrack(userId, input);
    return Map.of("id", id.toString());
  }

  @GetMapping("/{slug}")
  public AuthorTrackDetailResponse getBySlug(
      @PathVariable String slug, HttpServletRequest request) {
    Long userId = requireUserId(request);
    return authorTrackService.getBySlug(userId, slug);
  }

  @PatchMapping("/{slug}")
  public Map<String, Boolean> updateTrack(
      @PathVariable String slug,
      @RequestBody UpdateTrackRequest input,
      HttpServletRequest request) {
    Long userId = requireUserId(request);
    authorTrackService.updateTrack(userId, slug, input);
    return Map.of("ok", true);
  }

  @DeleteMapping("/{slug}")
  public Map<String, Boolean> removeTrack(@PathVariable String slug, HttpServletRequest request) {
    Long userId = requireUserId(request);
    authorTrackService.removeTrack(userId, slug);
    return Map.of("ok", true);
  }

  @PutMapping("/{slug}/packs/order")
  public Map<String, Boolean> reorderPacks(
      @PathVariable String slug,
      @RequestBody ReorderTrackPacksRequest input,
      HttpServletRequest request) {
    Long userId = requireUserId(request);
    authorTrackService.reorderPacks(userId, slug, input.packSlugs());
    return Map.of("ok", true);
  }
}
