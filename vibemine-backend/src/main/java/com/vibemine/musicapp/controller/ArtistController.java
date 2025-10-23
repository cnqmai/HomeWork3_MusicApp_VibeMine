package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.ArtistDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/artists")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ArtistController {
    private final ArtistService artistService;

    // FR-6.4: Chi tiết Artist
    @GetMapping("/{id}")
    public ResponseEntity<ArtistDTO> getArtist(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.getArtist(id));
    }

    // FR-6.4: Tracks của Artist
    @GetMapping("/{id}/tracks")
    public ResponseEntity<List<TrackResponseDTO>> getArtistTracks(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.getArtistTracks(id));
    }

    // FR-1.3: Tìm kiếm Artist
    @GetMapping("/search")
    public ResponseEntity<List<ArtistDTO>> searchArtists(@RequestParam String q) {
        return ResponseEntity.ok(artistService.searchArtists(q));
    }
}