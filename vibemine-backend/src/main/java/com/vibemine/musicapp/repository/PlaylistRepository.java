package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByUserId(Long userId); // FR-3.4
}