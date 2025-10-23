package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.AlbumDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.model.Album;
import com.vibemine.musicapp.repository.AlbumRepository;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService;
    private final ArtistService artistService;

    // FR-6.4: Lấy thông tin Album
    public AlbumDTO getAlbum(Long albumId) {
        return albumRepository.findById(albumId)
                .map(this::toDTO)
                .orElse(null);
    }

    // FR-6.4: Lấy danh sách tracks của Album (✅ SỬA LỖI - DÙNG LAMBDA)
    public List<TrackResponseDTO> getAlbumTracks(Long albumId) {
        return trackRepository.findByAlbum_Id(albumId)
                .stream()
                .map(track -> trackService.toResponseDTO(track)) // ✅ SỬA: DÙNG LAMBDA THAY VÌ METHOD REFERENCE
                .collect(Collectors.toList());
    }

    private AlbumDTO toDTO(Album album) {
        AlbumDTO dto = new AlbumDTO();
        dto.setId(album.getId());
        dto.setTitle(album.getTitle());
        dto.setCoverArtUrl(album.getCoverArtUrl());
        dto.setReleaseYear(album.getReleaseYear());
        
        // FR-1.2: Artist info
        if (album.getArtist() != null) {
            dto.setArtist(artistService.getArtist(album.getArtist().getId()));
        }
        return dto;
    }
}