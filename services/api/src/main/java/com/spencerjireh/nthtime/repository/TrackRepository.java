package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.Track;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackRepository extends JpaRepository<Track, Long> {

  Optional<Track> findBySlug(String slug);

  boolean existsBySlug(String slug);

  List<Track> findByAuthorUserId(Long userId);
}
