package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.*;
import com.vibemine.musicapp.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tracks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TrackController {
    private final TrackService trackService;

    // FR-1.1: Danh sách bài nhạc ✅ SỬA LỖI PAGINATION
    @GetMapping
    public ResponseEntity<List<TrackResponseDTO>> getAllTracks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(trackService.getAllTracks(pageable));
    }

    // FR-1.2: Chi tiết bài hát
    @GetMapping("/{id}")
    public ResponseEntity<TrackDetailDTO> getTrackDetail(@PathVariable Long id) {
        return trackService.getTrackDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // FR-1.3: Tìm kiếm ✅ SỬA LỖI PAGINATION
    @GetMapping("/search")
    public ResponseEntity<List<TrackResponseDTO>> searchTracks(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(trackService.searchTracks(q, page, size));
    }

    // FR-2.1: Play track
    @PostMapping("/{id}/play")
    public ResponseEntity<TrackResponseDTO> playTrack(@PathVariable Long id) {
        return ResponseEntity.ok(trackService.playTrack(id));
    }

    // FR-2.2: Next/Previous
    @GetMapping("/next/{currentId}")
    public ResponseEntity<TrackResponseDTO> getNextTrack(@PathVariable Long currentId) {
        return ResponseEntity.ok(trackService.getNextTrack(currentId));
    }

    @GetMapping("/prev/{currentId}")
    public ResponseEntity<TrackResponseDTO> getPreviousTrack(@PathVariable Long currentId) {
        return ResponseEntity.ok(trackService.getPreviousTrack(currentId));
    }

    // FR-6.4: Tracks theo Genre ✅ SỬA LỖI
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<TrackResponseDTO>> getTracksByGenre(
            @PathVariable String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(trackService.getTracksByGenre(genre, page, size));
    }

    // FR-6.2: Tải offline ✅ SỬA LỖI DTO
    @PostMapping("/users/{userId}/offline/{trackId}")
    public ResponseEntity<DownloadStatusDTO> downloadTrack(
            @PathVariable Long userId,
            @PathVariable Long trackId) {
        return ResponseEntity.ok(trackService.downloadTrack(userId, trackId));
    }

    // FR-8.2: Trending
    @GetMapping("/trending")
    public ResponseEntity<List<TrackResponseDTO>> getTrendingTracks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trackService.getTrendingTracks(limit));
    }

    // FR-9.1: Share ✅ SỬA LỖI DTO
    @GetMapping("/{id}/share")
    public ResponseEntity<ShareLinkDTO> getShareLink(@PathVariable Long id) {
        return ResponseEntity.ok(trackService.getShareLink(id));
    }
}