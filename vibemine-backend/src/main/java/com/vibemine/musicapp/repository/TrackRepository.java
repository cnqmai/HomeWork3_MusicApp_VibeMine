package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Track;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set; // Thêm import Set

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

    // Tối ưu Next/Prev
    Optional<Track> findFirstByIdGreaterThanOrderByIdAsc(Long currentId);
    Optional<Track> findFirstByIdLessThanOrderByIdDesc(Long currentId);
    Optional<Track> findFirstByOrderByIdAsc();
    Optional<Track> findFirstByOrderByIdDesc();

    // --- THÊM MỚI CHO GỢI Ý (FR-8.1) ---
    // Tìm theo Genre và loại trừ các ID đã nghe (Pageable để giới hạn)
    List<Track> findByGenreIgnoreCaseAndIdNotIn(String genre, Set<Long> listenedTrackIds, Pageable pageable);

    // Tìm theo Artist ID và loại trừ các ID đã nghe (Pageable để giới hạn)
    List<Track> findByArtists_IdAndIdNotIn(Long artistId, Set<Long> listenedTrackIds, Pageable pageable);
}