package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.AlbumDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/albums")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AlbumController {
    private final AlbumService albumService;

    // --- THÊM MỚI ---
    // Lấy tất cả album (để duyệt trên HomeScreen)
    @GetMapping
    public ResponseEntity<List<AlbumDTO>> getAllAlbums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(albumService.getAllAlbums(page, size));
    }
    // --- KẾT THÚC THÊM MỚI ---

    // FR-6.4: Chi tiết Album
    @GetMapping("/{id}")
    public ResponseEntity<AlbumDTO> getAlbum(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.getAlbum(id));
    }

    // FR-6.4: Tracks của Album
    @GetMapping("/{id}/tracks")
    public ResponseEntity<List<TrackResponseDTO>> getAlbumTracks(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.getAlbumTracks(id));
    }
}