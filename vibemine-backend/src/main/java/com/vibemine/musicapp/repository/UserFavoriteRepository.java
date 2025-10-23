package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.UserFavorite;
import com.vibemine.musicapp.model.UserFavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UserFavoriteId> {
    List<UserFavorite> findByUserId(Long userId);           // FR-3.4
    boolean existsByUserIdAndTrackId(Long userId, Long trackId); // FR-3.1
    void deleteByUserIdAndTrackId(Long userId, Long trackId);    // FR-3.1
}