package com.vibemine.musicapp.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vibemine.musicapp.model.Track;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {

    // Đảm bảo phương thức này tồn tại và đúng tên
    // Tìm theo Title HOẶC tên Artist (quan hệ @ManyToMany)
    List<Track> findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(String title, String artistName);

    // Đảm bảo phương thức này tồn tại và đúng tên
    List<Track> findByIsTrendingTrue(); // Có thể bạn cần phương thức này thay vì sắp xếp theo playCount ban đầu

    // Đảm bảo phương thức này tồn tại và đúng tên
    List<Track> findByGenreIgnoreCase(String genre);

    // Đảm bảo phương thức này tồn tại và đúng tên (Dùng cho Trending)
    List<Track> findAllByOrderByPlayCountDesc(Pageable pageable);
}