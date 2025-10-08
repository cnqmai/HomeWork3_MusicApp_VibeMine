// src/main/java/com/vibemine/musicapp/repository/PlaylistRepository.java

package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Playlist;
import com.vibemine.musicapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    // Tìm tất cả Playlist của một User cụ thể (FR-3.4)
    List<Playlist> findByUser(User user);

    // Tìm kiếm một Playlist theo ID và User
    Optional<Playlist> findByIdAndUser(Long id, User user);
}