package com.vibemine.musicapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.service.TrackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdvancedController {
    private final TrackService trackService;

    // FR-6.4: Tracks theo album -> ĐÃ XÓA/CHÚ THÍCH (vì đã có trong AlbumController)
    /*
    @GetMapping("/albums/{albumId}/tracks")
    public ResponseEntity<List<TrackResponseDTO>> getAlbumTracks(@PathVariable Long albumId) {
        return ResponseEntity.ok(trackService.getTracksByAlbum(albumId));
    }
    */

    // FR-6.4: Tracks theo artist -> ĐÃ XÓA/CHÚ THÍCH (vì đã có trong ArtistController)
    /*
    @GetMapping("/artists/{artistId}/tracks")
    public ResponseEntity<List<TrackResponseDTO>> getArtistTracks(@PathVariable Long artistId) {
        return ResponseEntity.ok(trackService.getTracksByArtist(artistId));
    }
    */

    // FR-6.4: Tracks theo genre -> GIỮ LẠI (vì endpoint này không bị trùng lặp)
    @GetMapping("/tracks/genre/{genre}")
    public ResponseEntity<List<TrackResponseDTO>> getTracksByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(trackService.getTracksByGenre(genre));
    }
}