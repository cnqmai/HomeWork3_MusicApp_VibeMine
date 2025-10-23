package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.CreatePlaylistRequest;
import com.vibemine.musicapp.dto.PlaylistDTO;
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

    // FR-3.4: Xem danh sách playlist riêng
    @GetMapping("/users/{userId}/playlists")
    public ResponseEntity<List<PlaylistDTO>> getUserPlaylists(@PathVariable Long userId) {
        return ResponseEntity.ok(playlistService.getUserPlaylists(userId));
    }

    // FR-3.2: Tạo playlist cá nhân
    @PostMapping("/users/{userId}/playlists")
    public ResponseEntity<PlaylistDTO> createPlaylist(
            @PathVariable Long userId,
            @RequestBody CreatePlaylistRequest request) {
        return ResponseEntity.ok(playlistService.createPlaylist(userId, request));
    }

    // FR-3.3: Thêm bài hát vào playlist
    @PostMapping("/playlists/{playlistId}/tracks/{trackId}")
    public ResponseEntity<PlaylistDTO> addTrackToPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long trackId) {
        return ResponseEntity.ok(playlistService.addTrackToPlaylist(playlistId, trackId));
    }

    // FR-3.3: Xóa bài hát khỏi playlist
    @DeleteMapping("/playlists/{playlistId}/tracks/{trackId}")
    public ResponseEntity<String> removeTrackFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long trackId) {
        playlistService.removeTrackFromPlaylist(playlistId, trackId);
        return ResponseEntity.ok("Track removed from playlist");
    }

    // FR-3.4: Xem chi tiết playlist (✅ SỬA LỖI - TRẢ VỀ PlaylistDTO TRỰC TIẾP)
    @GetMapping("/playlists/{playlistId}")
    public ResponseEntity<PlaylistDTO> getPlaylistDetail(@PathVariable Long playlistId) {
        PlaylistDTO playlist = playlistService.getPlaylistDetail(playlistId); // ✅ ĐÃ SỬA
        if (playlist != null) {
            return ResponseEntity.ok(playlist);
        }
        return ResponseEntity.notFound().build();
    }
}