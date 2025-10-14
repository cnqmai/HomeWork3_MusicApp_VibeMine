// src/main/java/com/vibemine/musicapp/repository/TrackRepository.java

package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {

    // Tìm kiếm bài hát theo tên hoặc ca sĩ/artist (sử dụng OR và tên liên kết)
    List<Track> findByTitleContainingIgnoreCaseOrArtist_NameContainingIgnoreCase(String title, String artistName);

    // Lấy danh sách nhạc xu hướng (FR-8.2)
    List<Track> findByIsTrendingTrue();
    
    // Lấy danh sách nhạc theo thể loại (FR-6.4)
    List<Track> findByGenreIgnoreCase(String genre);

    // Lấy danh sách nhạc theo tiêu chí "phổ biến nhất"
    List<Track> findAllByOrderByPlayCountDesc(Pageable pageable);
}