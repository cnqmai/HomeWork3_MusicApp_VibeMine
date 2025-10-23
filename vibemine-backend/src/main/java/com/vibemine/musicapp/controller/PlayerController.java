package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.PlayerStateDTO;
import com.vibemine.musicapp.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/player")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PlayerController {
    private final PlayerService playerService;

    // FR-7.1: Repeat mode
    @PatchMapping("/{sessionId}/repeat")
    public ResponseEntity<PlayerStateDTO> setRepeat(
            @PathVariable String sessionId,
            @RequestParam String mode) { // none, one, all
        return ResponseEntity.ok(playerService.setRepeatMode(sessionId, mode));
    }

    // FR-7.2: Shuffle
    @PatchMapping("/{sessionId}/shuffle")
    public ResponseEntity<PlayerStateDTO> toggleShuffle(@PathVariable String sessionId) {
        return ResponseEntity.ok(playerService.toggleShuffle(sessionId));
    }

    // FR-7.3: Volume
    @PatchMapping("/{sessionId}/volume")
    public ResponseEntity<PlayerStateDTO> setVolume(
            @PathVariable String sessionId,
            @RequestParam double volume) {
        return ResponseEntity.ok(playerService.setVolume(sessionId, volume));
    }

    // FR-2.3: Tạo session player
    @PostMapping("/session")
    public ResponseEntity<String> createSession() {
        return ResponseEntity.ok(playerService.createSession());
    }
}