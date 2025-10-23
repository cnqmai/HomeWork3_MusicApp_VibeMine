package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.TrackDetailDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
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

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. QUẢN LÝ NHẠC (FR-1)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // FR-1.1: Danh sách bài nhạc có sẵn
    @GetMapping
    public ResponseEntity<List<TrackResponseDTO>> getAllTracks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(trackService.getAllTracks(pageable));
    }

    // FR-1.2: Chi tiết bài hát (tên, ca sĩ, ảnh bìa)
    @GetMapping("/{id}")
    public ResponseEntity<TrackDetailDTO> getTrackDetail(@PathVariable Long id) {
        return trackService.getTrackDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // FR-1.3: Tìm kiếm theo tên/ca sĩ
    @GetMapping("/search")
    public ResponseEntity<List<TrackResponseDTO>> searchTracks(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(trackService.searchTracks(q, page, size));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. PHÁT NHẠC (FR-2)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // FR-2.2: Next Track
    @GetMapping("/next/{currentId}")
    public ResponseEntity<TrackResponseDTO> getNextTrack(@PathVariable Long currentId) {
        return ResponseEntity.ok(trackService.getNextTrack(currentId));
    }

    // FR-2.2: Previous Track
    @GetMapping("/prev/{currentId}")
    public ResponseEntity<TrackResponseDTO> getPreviousTrack(@PathVariable Long currentId) {
        return ResponseEntity.ok(trackService.getPreviousTrack(currentId));
    }

    // FR-2.1: Play track (tăng play count)
    @PostMapping("/{id}/play")
    public ResponseEntity<TrackResponseDTO> playTrack(@PathVariable Long id) {
        TrackResponseDTO track = trackService.playTrack(id);
        return ResponseEntity.ok(track);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. QUẢN LÝ NHẠC NÂNG CAO (FR-6.4)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // FR-6.4: Tracks theo Genre
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<TrackResponseDTO>> getTracksByGenre(
            @PathVariable String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(trackService.getTracksByGenre(genre, page, size));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. CÁ NHÂN HÓA & GỢI Ý (FR-8)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // FR-8.2: Nhạc xu hướng/Top bài hát
    @GetMapping("/trending")
    public ResponseEntity<List<TrackResponseDTO>> getTrendingTracks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trackService.getTrendingTracks(limit));
    }
}