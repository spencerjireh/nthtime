package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.dto.response.ChallengeResponse;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.service.ChallengeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChallengeController {

  private final ChallengeService challengeService;

  public ChallengeController(ChallengeService challengeService) {
    this.challengeService = challengeService;
  }

  @GetMapping("/api/challenges/{id}")
  public ChallengeResponse getChallenge(@PathVariable Long id) {
    ChallengeResponse response = challengeService.getChallenge(id);
    if (response == null) {
      throw new ResourceNotFoundException("Challenge not found");
    }
    return response;
  }

  @GetMapping("/api/packs/{packSlug}/challenges/{challengeSlug}")
  public ChallengeResponse getByPackAndSlug(
      @PathVariable String packSlug, @PathVariable String challengeSlug) {
    ChallengeResponse response = challengeService.getByPackAndSlug(packSlug, challengeSlug);
    if (response == null) {
      throw new ResourceNotFoundException("Challenge not found");
    }
    return response;
  }
}
