// src/main/java/com/vibemine/musicapp/service/TrackService.java

package com.vibemine.musicapp.service;

import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.model.Artist;
import com.vibemine.musicapp.model.Album;
import com.vibemine.musicapp.repository.TrackRepository;
import com.vibemine.musicapp.repository.ArtistRepository;
import com.vibemine.musicapp.repository.AlbumRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrackService {

    private final TrackRepository trackRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;

    public TrackService(TrackRepository trackRepository, ArtistRepository artistRepository, AlbumRepository albumRepository) {
        this.trackRepository = trackRepository;
        this.artistRepository = artistRepository;
        this.albumRepository = albumRepository;
    }

    // --- Chức năng Quản lý Nhạc (FR-1.1, FR-6.4) ---

    /**
     * Lấy tất cả bài hát (Danh sách nhạc có sẵn - FR-1.1).
     */
    public List<Track> getAllTracks() {
        return trackRepository.findAll();
    }

    /**
     * Lấy bài hát theo ID.
     */
    public Optional<Track> getTrackById(Long id) {
        // Tăng playCount khi có người dùng truy cập bài hát
        Optional<Track> track = trackRepository.findById(id);
        track.ifPresent(t -> {
            t.setPlayCount(t.getPlayCount() + 1);
            trackRepository.save(t);
        });
        return track;
    }
    
    // --- Chức năng Tìm kiếm (FR-1.3) ---
    
    /**
     * Tìm kiếm bài hát theo tên hoặc ca sĩ.
     */
    public List<Track> searchTracks(String keyword) {
        return trackRepository.findByTitleContainingIgnoreCaseOrArtist_NameContainingIgnoreCase(keyword, keyword);
    }
    
    // --- Chức năng Phân loại (FR-6.4, FR-8.2) ---

    /**
     * Lấy danh sách nhạc xu hướng (FR-8.2)
     */
    public List<Track> getTrendingTracks() {
        // Lấy 10 bài trending
        Pageable topTen = PageRequest.of(0, 10); 
        return trackRepository.findAllByOrderByPlayCountDesc(topTen);
        // Hoặc dùng: return trackRepository.findByIsTrendingTrue();
    }

    /**
     * Lấy danh sách bài hát theo thể loại (FR-6.4)
     */
    public List<Track> getTracksByGenre(String genre) {
        return trackRepository.findByGenreIgnoreCase(genre);
    }

    /**
     * Lấy danh sách bài hát theo Album (FR-6.4)
     */
    public Optional<Album> getAlbumWithTracks(Long albumId) {
        return albumRepository.findById(albumId); // JPA tự động fetch tracks do cấu hình trong Album.java
    }

    /**
     * Lấy danh sách bài hát của một Nghệ sĩ (FR-6.4)
     */
    public Optional<Artist> getArtistWithTracks(Long artistId) {
        return artistRepository.findById(artistId); // JPA tự động fetch tracks do cấu hình trong Artist.java
    }
}