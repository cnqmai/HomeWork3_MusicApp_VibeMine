package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.*;
import com.vibemine.musicapp.model.Playlist;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.repository.PlaylistRepository;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    private final PlaylistRepository playlistRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService;

    public List<PlaylistDTO> getUserPlaylists(Long userId) {
        return playlistRepository.findByUserId(userId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public PlaylistDTO createPlaylist(Long userId, CreatePlaylistRequest request) {
        Playlist playlist = new Playlist();
        playlist.setName(request.getName());
        playlist.setUserId(userId);
        playlist.setCreatedAt(LocalDateTime.now());
        playlist = playlistRepository.save(playlist);
        return toDTO(playlist);
    }

    @Transactional
    public PlaylistDTO addTrackToPlaylist(Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
        Track track = trackRepository.findById(trackId)
            .orElseThrow(() -> new RuntimeException("Track not found"));
        playlist.getTracks().add(track);
        playlistRepository.save(playlist);
        return toDTO(playlist);
    }

    @Transactional
    public void removeTrackFromPlaylist(Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
        playlist.getTracks().removeIf(t -> t.getId().equals(trackId));
        playlistRepository.save(playlist);
    }

    // ✅ SỬA LỖI: Trả PlaylistDTO trực tiếp
    public PlaylistDTO getPlaylistDetail(Long playlistId) {
        return playlistRepository.findById(playlistId)
            .map(this::toDTO)
            .orElse(null);
    }

    private PlaylistDTO toDTO(Playlist playlist) {
        PlaylistDTO dto = new PlaylistDTO();
        dto.setId(playlist.getId());
        dto.setName(playlist.getName());
        dto.setUserId(playlist.getUserId());
        dto.setCreatedAt(playlist.getCreatedAt());
        return dto;
    }
}