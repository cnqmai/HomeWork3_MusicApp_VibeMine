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
@RequestMapping("/api/v1") // Sửa: Đặt RequestMapping gốc ở đây
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TrackController {
    private final TrackService trackService;

    // FR-1.1: Danh sách bài nhạc
    @GetMapping("/tracks") // Sửa: Thêm prefix /tracks
    public ResponseEntity<List<TrackResponseDTO>> getAllTracks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(trackService.getAllTracks(pageable));
    }

    // FR-1.2: Chi tiết bài hát
    @GetMapping("/tracks/{id}") // Sửa: Thêm prefix /tracks
    public ResponseEntity<TrackDetailDTO> getTrackDetail(@PathVariable Long id) {
        return trackService.getTrackDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // FR-1.3: Tìm kiếm
    @GetMapping("/tracks/search") // Sửa: Thêm prefix /tracks
    public ResponseEntity<List<TrackResponseDTO>> searchTracks(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(trackService.searchTracks(q, page, size));
    }

    // --- SỬA LỖI (FR-2.1 & FR-8.3) ---
    // Sửa: Đổi endpoint để nhận userId và trackId
    @PostMapping("/users/{userId}/play/{trackId}")
    public ResponseEntity<TrackResponseDTO> playTrack(
            @PathVariable Long userId,
            @PathVariable Long trackId) {
        // Sửa: Gọi service với 2 tham số
        return ResponseEntity.ok(trackService.playTrack(userId, trackId));
    }
    // --- KẾT THÚC SỬA LỖI ---

    // FR-2.2: Next/Previous
    @GetMapping("/tracks/next/{currentId}") // Sửa: Thêm prefix /tracks
    public ResponseEntity<TrackResponseDTO> getNextTrack(@PathVariable Long currentId) {
        return ResponseEntity.ok(trackService.getNextTrack(currentId));
    }

    @GetMapping("/tracks/prev/{currentId}") // Sửa: Thêm prefix /tracks
    public ResponseEntity<TrackResponseDTO> getPreviousTrack(@PathVariable Long currentId) {
        return ResponseEntity.ok(trackService.getPreviousTrack(currentId));
    }

    // FR-6.4: Tracks theo Genre
    // Endpoint này bị trùng với /api/v1/tracks/genre/{genre} trong AdvancedController
    // Giữ lại endpoint trong AdvancedController và xóa/chú thích endpoint này
    /*
    @GetMapping("/tracks/genre/{genre}") // Sửa: Thêm prefix /tracks
    public ResponseEntity<List<TrackResponseDTO>> getTracksByGenre(
            @PathVariable String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(trackService.getTracksByGenre(genre, page, size));
    }
    */
    // Thay vào đó, đảm bảo AdvancedController đã có (đã có ở bước trước)

    // FR-6.2: Tải offline
    @PostMapping("/tracks/users/{userId}/offline/{trackId}") // Sửa: Thêm prefix /tracks
    public ResponseEntity<DownloadStatusDTO> downloadTrack(
            @PathVariable Long userId,
            @PathVariable Long trackId) {
        return ResponseEntity.ok(trackService.downloadTrack(userId, trackId));
    }

    // FR-8.2: Trending
    @GetMapping("/tracks/trending") // Sửa: Thêm prefix /tracks
    public ResponseEntity<List<TrackResponseDTO>> getTrendingTracks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trackService.getTrendingTracks(limit));
    }

    // FR-9.1: Share
    @GetMapping("/tracks/{id}/share") // Sửa: Thêm prefix /tracks
    public ResponseEntity<ShareLinkDTO> getShareLink(@PathVariable Long id) {
        return ResponseEntity.ok(trackService.getShareLink(id));
    }
}