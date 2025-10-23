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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaylistService {
    private final PlaylistRepository playlistRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService;

    // ✅ FR-3.4: Lấy playlists của user
    public List<PlaylistDTO> getUserPlaylists(Long userId) {
        return playlistRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ✅ FR-3.4: Chi tiết playlist (với tracks)
    public PlaylistDetailDTO getPlaylistDetail(Long playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        
        PlaylistDetailDTO dto = new PlaylistDetailDTO();
        dto.setId(playlist.getId());
        dto.setName(playlist.getName());
        dto.setCreatedAt(playlist.getCreatedAt());
        
        // ✅ Convert tracks to TrackResponseDTO
        List<TrackResponseDTO> trackDTOs = playlist.getTracks().stream()
                .map(trackService::toResponseDTO)
                .collect(Collectors.toList());
        dto.setTracks(trackDTOs);
        
        return dto;
    }

    // ✅ FR-3.2: Tạo playlist mới
    @Transactional
    public PlaylistDTO createPlaylist(Long userId, CreatePlaylistRequest request) {
        Playlist playlist = new Playlist();
        playlist.setName(request.getName());
        playlist.setUserId(userId);
        playlist.setCreatedAt(LocalDateTime.now());
        playlist = playlistRepository.save(playlist);
        return toDTO(playlist);
    }

    // ✅ FR-3.3: Thêm track vào playlist
    @Transactional
    public PlaylistDTO addTrackToPlaylist(Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Track not found"));
        
        // Kiểm tra track đã có chưa
        if (!playlist.getTracks().contains(track)) {
            playlist.getTracks().add(track);
            playlistRepository.save(playlist);
        }
        
        return toDTO(playlist);
    }

    // ✅ FR-3.3: Xóa track khỏi playlist
    @Transactional
    public PlaylistDTO removeTrackFromPlaylist(Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        
        playlist.getTracks().removeIf(t -> t.getId().equals(trackId));
        playlistRepository.save(playlist);
        return toDTO(playlist);
    }

    // ✅ PRIVATE: Convert to DTO
    private PlaylistDTO toDTO(Playlist playlist) {
        PlaylistDTO dto = new PlaylistDTO();
        dto.setId(playlist.getId());
        dto.setName(playlist.getName());
        dto.setUserId(playlist.getUserId());
        dto.setCreatedAt(playlist.getCreatedAt());
        dto.setTrackCount(playlist.getTracks().size());
        return dto;
    }
}