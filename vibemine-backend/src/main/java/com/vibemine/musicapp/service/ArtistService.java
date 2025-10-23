package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.ArtistDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.model.Artist;
import com.vibemine.musicapp.repository.ArtistRepository;
import com.vibemine.musicapp.repository.TrackRepository;
// Bỏ import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy; // Thêm import này
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
// @RequiredArgsConstructor // Bỏ chú thích này
public class ArtistService {
    private final ArtistRepository artistRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService; // Dependency gây ra vòng tròn

    // Sử dụng Constructor Injection với @Lazy cho TrackService
    public ArtistService(ArtistRepository artistRepository,
                         TrackRepository trackRepository,
                         @Lazy TrackService trackService) { // Thêm @Lazy ở đây
        this.artistRepository = artistRepository;
        this.trackRepository = trackRepository;
        this.trackService = trackService;
    }

    // --- THÊM MỚI ---
    // Lấy tất cả artists (phân trang)
    public List<ArtistDTO> getAllArtists(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return artistRepository.findAll(pageable).stream()
                .map(this::toDTO) // Gọi hàm toDTO nội bộ
                .collect(Collectors.toList());
    }
    // --- KẾT THÚC THÊM MỚI ---

    // FR-6.4: Lấy thông tin Artist
    public ArtistDTO getArtist(Long artistId) {
        return artistRepository.findById(artistId)
                .map(this::toDTO) // Gọi hàm toDTO nội bộ
                .orElse(null); // Trả về null nếu không tìm thấy
    }

    // FR-6.4: Lấy danh sách tracks của Artist
    public List<TrackResponseDTO> getArtistTracks(Long artistId) {
        // Gọi trackService ở đây sẽ kích hoạt @Lazy dependency
        return trackRepository.findByArtists_Id(artistId)
                .stream()
                .map(trackService::toResponseDTO) // Sử dụng trackService đã inject (lazy)
                .collect(Collectors.toList());
    }

    // FR-1.3: Tìm kiếm Artist
    public List<ArtistDTO> searchArtists(String keyword) {
        return artistRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::toDTO) // Gọi hàm toDTO nội bộ
                .collect(Collectors.toList());
    }

    // Hàm chuyển đổi Artist -> ArtistDTO (có thể để public nếu service khác cần)
    public ArtistDTO toDTO(Artist artist) {
        if (artist == null) return null;
        ArtistDTO dto = new ArtistDTO();
        dto.setId(artist.getId());
        dto.setName(artist.getName());
        dto.setAvatarUrl(artist.getAvatarUrl());
        // Không cần gọi service khác ở đây
        return dto;
    }
}