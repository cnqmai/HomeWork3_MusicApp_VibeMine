package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.*;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackService {
    private final TrackRepository trackRepository;

    // FR-1.1
    public List<TrackResponseDTO> getAllTracks() {
        return trackRepository.findAll().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // FR-1.2
    public Optional<TrackDetailDTO> getTrackDetail(Long id) {
        return trackRepository.findById(id).map(track -> {
            TrackDetailDTO dto = new TrackDetailDTO();
            dto.setTrack(toResponseDTO(track));
            dto.setLyrics(track.getLyrics());
            return dto;
        });
    }

    // FR-1.3
    public List<TrackResponseDTO> searchTracks(String keyword) {
        return trackRepository
            .findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(keyword, keyword)
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // FR-2.2 Next Track
    public TrackResponseDTO getNextTrack(Long currentId) {
        List<TrackResponseDTO> allTracks = getAllTracks();
        int currentIndex = (int) allTracks.stream()
            .filter(t -> t.getId().equals(currentId)).count();
        return allTracks.get((currentIndex + 1) % allTracks.size());
    }

    // FR-2.2 Previous Track
    public TrackResponseDTO getPreviousTrack(Long currentId) {
        List<TrackResponseDTO> allTracks = getAllTracks();
        int currentIndex = (int) allTracks.stream()
            .filter(t -> t.getId().equals(currentId)).count() - 1;
        if (currentIndex < 0) currentIndex = allTracks.size() - 1;
        return allTracks.get(currentIndex % allTracks.size());
    }

    // FR-2.1: Play track (tăng play count)
    public TrackResponseDTO playTrack(Long id) {
        Track track = trackRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Track not found"));
        track.setPlayCount(track.getPlayCount() + 1);
        trackRepository.save(track);
        return toResponseDTO(track);
    }

    // FR-8.2
    public List<TrackResponseDTO> getTrendingTracks(int limit) {
        return trackRepository.findAllByOrderByPlayCountDesc(PageRequest.of(0, limit))
            .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // ✅ PUBLIC - SỬA LỖI PRIVATE ACCESS
    public TrackResponseDTO toResponseDTO(Track track) {
        TrackResponseDTO dto = new TrackResponseDTO();
        dto.setId(track.getId());
        dto.setTitle(track.getTitle());
        dto.setCoverArtUrl(track.getCoverArtUrl());
        dto.setTrackUrl(track.getTrackUrl());
        dto.setDuration(track.getDuration());
        dto.setPlayCount(track.getPlayCount());
        dto.setFavoriteCount(track.getFavoriteCount());
        dto.setTrending(track.isTrending());  // ✅ SỬA: setTrending thay vì setIsTrending
        
        if (track.getArtists() != null) {
            dto.setArtists(track.getArtists().stream()
                .map(a -> {
                    ArtistDTO adto = new ArtistDTO();
                    adto.setId(a.getId());
                    adto.setName(a.getName());
                    adto.setAvatarUrl(a.getAvatarUrl());
                    return adto;
                }).collect(Collectors.toList()));
        }
        return dto;
    }
}