package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.dto.response.ChallengeResponse;
import com.spencerjireh.nthtime.dto.response.CliChallengeResponse;
import com.spencerjireh.nthtime.dto.response.CliPackResponse;
import com.spencerjireh.nthtime.dto.response.PackChallengesResponse;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.service.ChallengeService;
import com.spencerjireh.nthtime.service.PackService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cli")
public class CliController {

  private final PackService packService;
  private final ChallengeService challengeService;

  public CliController(PackService packService, ChallengeService challengeService) {
    this.packService = packService;
    this.challengeService = challengeService;
  }

  @GetMapping("/pack/{packSlug}")
  public CliPackResponse getPackChallenges(@PathVariable String packSlug) {
    PackChallengesResponse data = packService.getChallenges(packSlug, null);
    if (data == null) {
      throw new ResourceNotFoundException("Pack not found");
    }
    var challenges =
        data.challenges().stream()
            .map(
                c ->
                    new CliPackResponse.CliChallengeSummary(
                        c.slug(), c.title(), c.difficulty(), c.order()))
            .toList();
    return new CliPackResponse(
        data.pack().name(),
        data.pack().slug(),
        data.pack().description(),
        data.pack().language(),
        data.pack().framework(),
        challenges);
  }

  @GetMapping("/challenge/{packSlug}/{challengeSlug}")
  public CliChallengeResponse getChallenge(
      @PathVariable String packSlug, @PathVariable String challengeSlug) {
    ChallengeResponse cr = challengeService.getByPackAndSlug(packSlug, challengeSlug);
    if (cr == null) {
      throw new ResourceNotFoundException("Challenge not found");
    }
    return new CliChallengeResponse(
        cr.slug(),
        cr.title(),
        cr.prompt(),
        cr.difficulty(),
        cr.hints(),
        cr.assertions(),
        cr.referenceSolution(),
        packSlug);
  }
}
