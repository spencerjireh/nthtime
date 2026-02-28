package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.Challenge;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

  List<Challenge> findByPackIdOrderByOrderAsc(Long packId);

  Optional<Challenge> findByPackIdAndOrder(Long packId, int order);

  Optional<Challenge> findByPackIdAndSlug(Long packId, String slug);

  int countByPackId(Long packId);

  @Query("SELECT MAX(c.order) FROM Challenge c WHERE c.pack.id = :packId")
  Optional<Integer> findMaxOrderByPackId(@Param("packId") Long packId);

  @Modifying
  void deleteByPackId(Long packId);

  @Modifying
  @Query("DELETE FROM Challenge c WHERE c.pack.id = :packId")
  void deleteAllByPackId(@Param("packId") Long packId);

  @Query(
      value =
          "SELECT c.* FROM challenges c WHERE c.search_vector @@ plainto_tsquery('english', :query) LIMIT 20",
      nativeQuery = true)
  List<Challenge> searchByTitle(@Param("query") String query);
}
