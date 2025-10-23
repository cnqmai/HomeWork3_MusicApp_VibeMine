package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.HistoryDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.service.PlayHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HistoryController {
    private final PlayHistoryService playHistoryService;

    // FR-8.3: Lịch sử nghe nhạc
    @GetMapping("/users/{userId}/history")
    public ResponseEntity<List<HistoryDTO>> getUserHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(playHistoryService.getUserHistory(userId, limit));
    }

    // FR-8.1: Gợi ý dựa trên lịch sử
    @GetMapping("/users/{userId}/recommendations")
    public ResponseEntity<List<TrackResponseDTO>> getRecommendations(@PathVariable Long userId) {
        return ResponseEntity.ok(playHistoryService.getRecommendations(userId));
    }
}