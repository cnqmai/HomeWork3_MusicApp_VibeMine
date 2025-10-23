// src/main/java/com/vibemine/musicapp/controller/TrackController.java

package com.vibemine.musicapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vibemine.musicapp.model.Album;
import com.vibemine.musicapp.model.Artist;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.service.TrackService;

@RestController
@RequestMapping("/api/track")
public class TrackController {

    private final TrackService trackService;

    public TrackController(TrackService trackService) {
        this.trackService = trackService;
    }

    /**
     * Lấy tất cả bài hát (Màn hình chính - FR-1.1)
     */
    @GetMapping
    public List<Track> getAllTracks() {
        return trackService.getAllTracks();
    }

    /**
     * Lấy chi tiết bài hát theo ID (FR-1.2)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Track> getTrackById(@PathVariable Long id) {
        return trackService.getTrackById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Tìm kiếm bài hát theo từ khóa (FR-1.3)
     */
    @GetMapping("/search")
    public List<Track> searchTracks(@RequestParam String keyword) {
        return trackService.searchTracks(keyword);
    }

    /**
     * Lấy danh sách nhạc xu hướng (FR-8.2)
     */
    @GetMapping("/trending")
    public List<Track> getTrendingTracks() {
        return trackService.getTrendingTracks();
    }

    /**
     * Lấy danh sách bài hát theo Album (FR-6.4)
     */
    @GetMapping("/album/{albumId}")
    public ResponseEntity<Album> getTracksByAlbum(@PathVariable Long albumId) {
        return trackService.getAlbumWithTracks(albumId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy danh sách bài hát theo Artist (FR-6.4)
     */
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<Artist> getTracksByArtist(@PathVariable Long artistId) {
        return trackService.getArtistWithTracks(artistId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}