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

    List<Track> findByIsTrendingTrue();
    
    List<Track> findByGenreIgnoreCase(String genre);

    List<Track> findAllByOrderByPlayCountDesc(Pageable pageable);
}