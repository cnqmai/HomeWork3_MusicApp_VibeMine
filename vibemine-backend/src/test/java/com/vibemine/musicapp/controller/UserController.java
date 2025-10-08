// src/main/java/com/vibemine/musicapp/controller/UserController.java

package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.model.Playlist;
import com.vibemine.musicapp.model.ListeningHistory;
import com.vibemine.musicapp.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // TODO: Trong ứng dụng thực tế, userId nên được lấy từ JWT Token của người dùng đang đăng nhập

    // --- Favorites (FR-3.1, FR-3.4) ---

    /**
     * Toggle Favorite (Thêm/Xóa khỏi Favorites - FR-3.1)
     */
    @PostMapping("/{userId}/favorites/toggle/{trackId}")
    public ResponseEntity<?> toggleFavorite(@PathVariable Long userId, @PathVariable Long trackId) {
        try {
            userService.toggleFavorite(userId, trackId);
            return ResponseEntity.ok("Thao tác yêu thích thành công.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Lấy danh sách yêu thích (FR-3.4)
     */
    @GetMapping("/{userId}/favorites")
    public List<Track> getFavoriteTracks(@PathVariable Long userId) {
        return userService.getFavoriteTracks(userId);
    }
    
    // --- Playlist (FR-3.2, FR-3.3, FR-3.4) ---

    /**
     * Tạo Playlist mới (FR-3.2)
     */
    @PostMapping("/{userId}/playlists")
    public Playlist createPlaylist(@PathVariable Long userId, @RequestParam String name) {
        return userService.createPlaylist(userId, name);
    }
    
    /**
     * Lấy danh sách Playlist của User (FR-3.4)
     */
    @GetMapping("/{userId}/playlists")
    public List<Playlist> getUserPlaylists(@PathVariable Long userId) {
        return userService.getUserPlaylists(userId);
    }

    /**
     * Thêm bài hát vào Playlist (FR-3.3)
     */
    @PostMapping("/{userId}/playlists/{playlistId}/add/{trackId}")
    public ResponseEntity<Playlist> addTrackToPlaylist(
        @PathVariable Long userId,
        @PathVariable Long playlistId,
        @PathVariable Long trackId
    ) {
        try {
            Playlist updatedPlaylist = userService.addTrackToPlaylist(userId, playlistId, trackId);
            return ResponseEntity.ok(updatedPlaylist);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // --- History (FR-8.3) ---

    /**
     * Ghi lại lịch sử nghe nhạc (gọi khi bài hát bắt đầu phát/nghe hết)
     */
    @PostMapping("/{userId}/history/log/{trackId}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Không cần trả về nội dung
    public void logListenHistory(@PathVariable Long userId, @PathVariable Long trackId) {
        userService.logListenHistory(userId, trackId);
    }
    
    /**
     * Lấy lịch sử nghe (FR-8.3)
     */
    @GetMapping("/{userId}/history")
    public List<ListeningHistory> getListeningHistory(@PathVariable Long userId) {
        return userService.getListeningHistory(userId);
    }
}