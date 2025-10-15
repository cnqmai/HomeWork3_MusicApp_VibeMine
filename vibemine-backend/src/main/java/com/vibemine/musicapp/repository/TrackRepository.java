// src/main/java/com/vibemine/musicapp/repository/TrackRepository.java

package com.vibemine.musicapp.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vibemine.musicapp.model.Track;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {

    // SỬA LỖI: Đổi "Artist" thành "Artists" để khớp với Model
    List<Track> findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(String title, String artistName);

    // Lấy danh sách nhạc xu hướng (FR-8.2)
    List<Track> findByIsTrendingTrue();
    
    // Lấy danh sách nhạc theo thể loại (FR-6.4)
    List<Track> findByGenreIgnoreCase(String genre);

    // Lấy danh sách nhạc theo tiêu chí "phổ biến nhất"
    List<Track> findAllByOrderByPlayCountDesc(Pageable pageable);
}