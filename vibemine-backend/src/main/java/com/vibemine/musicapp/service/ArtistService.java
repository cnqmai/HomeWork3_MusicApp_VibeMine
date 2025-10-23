package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.ArtistDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.model.Artist;
import com.vibemine.musicapp.repository.ArtistRepository;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArtistService {
    private final ArtistRepository artistRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService;

    // FR-6.4: Lấy thông tin Artist
    public ArtistDTO getArtist(Long artistId) {
        return artistRepository.findById(artistId)
                .map(this::toDTO)
                .orElse(null);
    }

    // FR-6.4: Lấy danh sách tracks của Artist
    public List<TrackResponseDTO> getArtistTracks(Long artistId) {
        return trackRepository.findByArtists_Id(artistId)
                .stream()
                .map(track -> trackService.toResponseDTO(track))
                .collect(Collectors.toList());
    }

    // FR-1.3: Tìm kiếm Artist
    public List<ArtistDTO> searchArtists(String keyword) {
        return artistRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ArtistDTO toDTO(Artist artist) {
        ArtistDTO dto = new ArtistDTO();
        dto.setId(artist.getId());
        dto.setName(artist.getName());
        dto.setAvatarUrl(artist.getAvatarUrl());
        return dto;
    }
}