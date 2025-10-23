package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdvancedController {
    private final TrackService trackService;

    // FR-6.4: Tracks theo album
    @GetMapping("/albums/{albumId}/tracks")
    public ResponseEntity<List<TrackResponseDTO>> getAlbumTracks(@PathVariable Long albumId) {
        return ResponseEntity.ok(trackService.getTracksByAlbum(albumId));
    }

    // FR-6.4: Tracks theo artist
    @GetMapping("/artists/{artistId}/tracks")
    public ResponseEntity<List<TrackResponseDTO>> getArtistTracks(@PathVariable Long artistId) {
        return ResponseEntity.ok(trackService.getTracksByArtist(artistId));
    }

    // FR-6.4: Tracks theo genre
    @GetMapping("/tracks/genre/{genre}")
    public ResponseEntity<List<TrackResponseDTO>> getTracksByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(trackService.getTracksByGenre(genre));
    }
}