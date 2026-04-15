package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.Attempt;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {

  List<Attempt> findByUserIdAndChallengeId(Long userId, Long challengeId);

  @Modifying
  void deleteByChallengeId(Long challengeId);

  @Query(
      "SELECT DISTINCT a.challenge.id FROM Attempt a WHERE a.user.id = :userId AND a.passed = true")
  Set<Long> findPassedChallengeIdsByUserId(@Param("userId") Long userId);

  @Query("SELECT a.challenge.id, a.passed FROM Attempt a WHERE a.user.id = :userId")
  List<Object[]> findChallengeStatusesByUserId(@Param("userId") Long userId);

  @Query("SELECT a.createdAt FROM Attempt a WHERE a.user.id = :userId AND a.passed = true")
  List<Instant> findPassedAtByUserId(@Param("userId") Long userId);
}
