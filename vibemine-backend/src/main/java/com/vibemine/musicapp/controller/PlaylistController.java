package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.*;
import com.vibemine.musicapp.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PlaylistController {
    private final PlaylistService playlistService;

    // ✅ FR-3.4: Lấy playlists của user
    @GetMapping("/users/{userId}/playlists")
    public ResponseEntity<List<PlaylistDTO>> getUserPlaylists(@PathVariable Long userId) {
        return ResponseEntity.ok(playlistService.getUserPlaylists(userId));
    }

    // ✅ FR-3.4: Chi tiết playlist
    @GetMapping("/playlists/{playlistId}")
    public ResponseEntity<PlaylistDetailDTO> getPlaylistDetail(@PathVariable Long playlistId) {
        return ResponseEntity.ok(playlistService.getPlaylistDetail(playlistId));
    }

    // ✅ FR-3.2: Tạo playlist mới
    @PostMapping("/users/{userId}/playlists")
    public ResponseEntity<PlaylistDTO> createPlaylist(
            @PathVariable Long userId,
            @RequestBody CreatePlaylistRequest request) {
        return ResponseEntity.ok(playlistService.createPlaylist(userId, request));
    }

    // ✅ FR-3.3: Thêm track vào playlist
    @PostMapping("/playlists/{playlistId}/tracks/{trackId}")
    public ResponseEntity<PlaylistDTO> addTrackToPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long trackId) {
        return ResponseEntity.ok(playlistService.addTrackToPlaylist(playlistId, trackId));
    }

    // ✅ FR-3.3: Xóa track khỏi playlist
    @DeleteMapping("/playlists/{playlistId}/tracks/{trackId}")
    public ResponseEntity<Void> removeTrackFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long trackId) {
        playlistService.removeTrackFromPlaylist(playlistId, trackId);
        return ResponseEntity.ok().build();
    }
}