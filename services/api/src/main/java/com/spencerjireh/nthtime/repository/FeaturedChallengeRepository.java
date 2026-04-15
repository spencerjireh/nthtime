package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.FeaturedChallenge;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeaturedChallengeRepository extends JpaRepository<FeaturedChallenge, LocalDate> {

  Optional<FeaturedChallenge> findByDate(LocalDate date);
}
