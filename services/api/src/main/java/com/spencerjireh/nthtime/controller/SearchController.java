package com.spencerjireh.nthtime.controller;

import com.spencerjireh.nthtime.dto.response.SearchResultResponse;
import com.spencerjireh.nthtime.service.SearchService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

  private final SearchService searchService;

  public SearchController(SearchService searchService) {
    this.searchService = searchService;
  }

  @GetMapping
  public List<SearchResultResponse> searchChallenges(@RequestParam String q) {
    return searchService.searchChallenges(q);
  }
}
