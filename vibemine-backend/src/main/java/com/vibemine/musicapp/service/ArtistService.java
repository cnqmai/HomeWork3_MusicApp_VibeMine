package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.ArtistDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.model.Artist;
import com.vibemine.musicapp.repository.ArtistRepository;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest; // Thêm import
import org.springframework.data.domain.Pageable; // Thêm import
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArtistService {
    private final ArtistRepository artistRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService;

    // --- THÊM MỚI ---
    // Lấy tất cả artists (phân trang)
    public List<ArtistDTO> getAllArtists(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return artistRepository.findAll(pageable).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    // --- KẾT THÚC THÊM MỚI ---

    // FR-6.4: Lấy thông tin Artist
    public ArtistDTO getArtist(Long artistId) {
        return artistRepository.findById(artistId)
                .map(this::toDTO)
                .orElse(null); // Trả về null nếu không tìm thấy
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

    // Hàm chuyển đổi (giữ nguyên, có thể để public nếu AlbumService cần)
    public ArtistDTO toDTO(Artist artist) {
        if (artist == null) return null;
        ArtistDTO dto = new ArtistDTO();
        dto.setId(artist.getId());
        dto.setName(artist.getName());
        dto.setAvatarUrl(artist.getAvatarUrl());
        return dto;
    }
}