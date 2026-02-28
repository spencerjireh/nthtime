package com.spencerjireh.nthtime.service;

import com.spencerjireh.nthtime.dto.response.SearchResultResponse;
import com.spencerjireh.nthtime.entity.Challenge;
import com.spencerjireh.nthtime.repository.ChallengeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SearchService {

  private final ChallengeRepository challengeRepository;

  public SearchService(ChallengeRepository challengeRepository) {
    this.challengeRepository = challengeRepository;
  }

  public List<SearchResultResponse> searchChallenges(String query) {
    if (query == null || query.isBlank()) return List.of();

    List<Challenge> results = challengeRepository.searchByTitle(query);

    return results.stream()
        .map(
            c ->
                new SearchResultResponse(
                    c.getId().toString(),
                    c.getPack().getId().toString(),
                    c.getSlug(),
                    c.getTitle(),
                    c.getDifficulty(),
                    c.getTags(),
                    c.getTimeEstimateSeconds(),
                    c.getOrder()))
        .toList();
  }
}
