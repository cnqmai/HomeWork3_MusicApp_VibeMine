package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.service.UserFavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserFavoriteController {
    private final UserFavoriteService favoriteService;

    // FR-3.1: Thêm vào yêu thích
    @PostMapping("/users/{userId}/favorites/{trackId}")
    public ResponseEntity<String> addToFavorites(
            @PathVariable Long userId, 
            @PathVariable Long trackId) {
        boolean success = favoriteService.addToFavorites(userId, trackId);
        return success ? 
            ResponseEntity.ok("Added to favorites") : 
            ResponseEntity.badRequest().body("Already in favorites");
    }

    // FR-3.1: Xóa khỏi yêu thích
    @DeleteMapping("/users/{userId}/favorites/{trackId}")
    public ResponseEntity<String> removeFromFavorites(
            @PathVariable Long userId, 
            @PathVariable Long trackId) {
        boolean success = favoriteService.removeFromFavorites(userId, trackId);
        return success ? 
            ResponseEntity.ok("Removed from favorites") : 
            ResponseEntity.badRequest().body("Not in favorites");
    }

    // FR-3.4: Lấy danh sách yêu thích
    @GetMapping("/users/{userId}/favorites")
    public ResponseEntity<List<TrackResponseDTO>> getUserFavorites(@PathVariable Long userId) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(userId));
    }
}