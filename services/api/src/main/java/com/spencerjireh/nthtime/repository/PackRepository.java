package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.Pack;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PackRepository extends JpaRepository<Pack, Long> {

  Optional<Pack> findBySlug(String slug);

  boolean existsBySlug(String slug);

  List<Pack> findByAuthorUserId(Long userId);

  @Query("SELECT p FROM Pack p WHERE p.visibility = 'public' OR p.authorUser.id = :userId")
  List<Pack> findVisiblePacks(@Param("userId") Long userId);

  @Query("SELECT p FROM Pack p WHERE p.visibility = 'public'")
  List<Pack> findPublicPacks();

  @Query(
      "SELECT p FROM Pack p WHERE p.visibility = 'public' OR p.visibility = 'unlisted' OR p.authorUser.id = :userId")
  List<Pack> findAccessiblePacks(@Param("userId") Long userId);
}
