package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.PlayHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
    List<PlayHistory> findByUserIdOrderByPlayedAtDesc(Long userId);
    
    @Query("SELECT ph.track.id, COUNT(ph) as count FROM PlayHistory ph WHERE ph.userId = :userId GROUP BY ph.track.id ORDER BY count DESC")
    List<Object[]> findTopTracksByUserId(Long userId); // FR-8.1
}