package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.PlayHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Set; // Thêm import Set

public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
    List<PlayHistory> findByUserIdOrderByPlayedAtDesc(Long userId);
    
    // Lấy top tracks (ID và số lần nghe)
    @Query("SELECT ph.trackId, COUNT(ph.trackId) as count FROM PlayHistory ph WHERE ph.userId = :userId GROUP BY ph.trackId ORDER BY count DESC")
    List<Object[]> findTopTrackIdsByUserId(Long userId); // Đổi tên cho rõ ràng

    // --- THÊM MỚI ---
    // Lấy tất cả các trackId duy nhất mà user đã nghe
    @Query("SELECT DISTINCT ph.trackId FROM PlayHistory ph WHERE ph.userId = :userId")
    Set<Long> findAllTrackIdsByUserId(Long userId);
}