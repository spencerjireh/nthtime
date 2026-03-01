package com.spencerjireh.nthtime.controller;

import static com.spencerjireh.nthtime.util.SessionUtils.requireUserId;

import com.spencerjireh.nthtime.dto.request.CreatePackRequest;
import com.spencerjireh.nthtime.dto.request.UpdatePackRequest;
import com.spencerjireh.nthtime.dto.response.AuthorPackDetailResponse;
import com.spencerjireh.nthtime.dto.response.AuthorPackExportResponse;
import com.spencerjireh.nthtime.dto.response.AuthorPackSummaryResponse;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/author/packs")
public class AuthorPackController {

  private final AuthorPackService authorPackService;

  public AuthorPackController(AuthorPackService authorPackService) {
    this.authorPackService = authorPackService;
  }

  @GetMapping
  public List<AuthorPackSummaryResponse> myPacks(HttpServletRequest request) {
    Long userId = requireUserId(request);
    return authorPackService.myPacks(userId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> createPack(
      @Valid @RequestBody CreatePackRequest input, HttpServletRequest request) {
    Long userId = requireUserId(request);
    Long id = authorPackService.createPack(userId, input);
    return Map.of("id", id.toString());
  }

  @GetMapping("/{slug}")
  public AuthorPackDetailResponse getBySlug(@PathVariable String slug, HttpServletRequest request) {
    Long userId = requireUserId(request);
    AuthorPackDetailResponse response = authorPackService.getBySlug(userId, slug);
    if (response == null) {
      throw new ResourceNotFoundException("Pack not found");
    }
    return response;
  }

  @PatchMapping("/{slug}")
  public Map<String, Boolean> updatePack(
      @PathVariable String slug, @RequestBody UpdatePackRequest input, HttpServletRequest request) {
    Long userId = requireUserId(request);
    AuthorPackDetailResponse pack = authorPackService.getBySlug(userId, slug);
    if (pack == null) {
      throw new ResourceNotFoundException("Pack not found");
    }
    Long packId = Long.parseLong(pack.id());
    authorPackService.updatePack(userId, packId, input);
    return Map.of("ok", true);
  }

  @DeleteMapping("/{slug}")
  public Map<String, Boolean> removePack(@PathVariable String slug, HttpServletRequest request) {
    Long userId = requireUserId(request);
    AuthorPackDetailResponse pack = authorPackService.getBySlug(userId, slug);
    if (pack == null) {
      throw new ResourceNotFoundException("Pack not found");
    }
    Long packId = Long.parseLong(pack.id());
    authorPackService.removePack(userId, packId);
    return Map.of("ok", true);
  }

  @GetMapping("/{slug}/export")
  public AuthorPackExportResponse getForExport(
      @PathVariable String slug, HttpServletRequest request) {
    Long userId = requireUserId(request);
    AuthorPackExportResponse response = authorPackService.getForExport(userId, slug);
    if (response == null) {
      throw new ResourceNotFoundException("Pack not found");
    }
    return response;
  }

  @GetMapping("/check-slug")
  public Map<String, Boolean> checkSlugAvailable(
      @RequestParam String slug,
      @RequestParam(required = false) Long excludePackId,
      HttpServletRequest request) {
    requireUserId(request);
    boolean available = authorPackService.checkSlugAvailable(slug, excludePackId);
    return Map.of("available", available);
  }
}
