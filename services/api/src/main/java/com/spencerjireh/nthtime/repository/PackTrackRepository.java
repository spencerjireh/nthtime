package com.spencerjireh.nthtime.repository;

import com.spencerjireh.nthtime.entity.PackTrack;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface PackTrackRepository extends JpaRepository<PackTrack, Long> {

  List<PackTrack> findByTrackIdOrderByPositionAsc(Long trackId);

  List<PackTrack> findByPackId(Long packId);

  @Modifying
  @Query("DELETE FROM PackTrack pt WHERE pt.track.id = :trackId")
  void deleteByTrackId(Long trackId);
}
