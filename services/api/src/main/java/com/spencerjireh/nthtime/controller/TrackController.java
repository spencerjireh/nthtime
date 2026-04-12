package com.spencerjireh.nthtime.controller;

import static com.spencerjireh.nthtime.util.SessionUtils.getUserId;

import com.spencerjireh.nthtime.dto.response.TrackDetailResponse;
import com.spencerjireh.nthtime.dto.response.TrackSummaryResponse;
import com.spencerjireh.nthtime.exception.ResourceNotFoundException;
import com.spencerjireh.nthtime.service.TrackService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tracks")
public class TrackController {

  private final TrackService trackService;

  public TrackController(TrackService trackService) {
    this.trackService = trackService;
  }

  @GetMapping
  public List<TrackSummaryResponse> listTracks() {
    return trackService.listTracks();
  }

  @GetMapping("/{slug}")
  public TrackDetailResponse getTrack(@PathVariable String slug, HttpServletRequest request) {
    Long userId = getUserId(request);
    TrackDetailResponse response = trackService.getTrack(slug, userId);
    if (response == null) {
      throw new ResourceNotFoundException("Track not found");
    }
    return response;
  }
}
