package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Track;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrackRepository extends JpaRepository<Track, Long> {
    // FR-1.3
    List<Track> findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(
        String title, String artistName);
    
    // FR-8.2
    List<Track> findAllByOrderByPlayCountDesc(Pageable pageable);
    
    // FR-6.4
    List<Track> findByGenreIgnoreCase(String genre);
    
    // FR-6.4: Tracks theo Artist
    List<Track> findByArtists_Id(Long artistId);
    
    // FR-6.4: Tracks theo Album  
    List<Track> findByAlbum_Id(Long albumId);
}