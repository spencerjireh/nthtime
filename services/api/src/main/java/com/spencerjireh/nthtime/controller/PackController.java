package com.spencerjireh.nthtime.controller;

import static com.spencerjireh.nthtime.util.SessionUtils.getUserId;

import com.spencerjireh.nthtime.dto.response.PackChallengesResponse;
import com.spencerjireh.nthtime.dto.response.PackListResponse;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.service.PackService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/packs")
public class PackController {

  private final PackService packService;

  public PackController(PackService packService) {
    this.packService = packService;
  }

  @GetMapping
  public PackListResponse listPacks(
      @RequestParam(required = false) String language,
      @RequestParam(required = false) String difficulty,
      @RequestParam(required = false) List<String> tags,
      HttpServletRequest request) {
    Long userId = getUserId(request);
    return packService.listPacks(language, difficulty, tags, userId);
  }

  @GetMapping("/{slug}")
  public PackChallengesResponse getChallenges(
      @PathVariable String slug, HttpServletRequest request) {
    Long userId = getUserId(request);
    PackChallengesResponse response = packService.getChallenges(slug, userId);
    if (response == null) {
      throw new ResourceNotFoundException("Pack not found");
    }
    return response;
  }
}
