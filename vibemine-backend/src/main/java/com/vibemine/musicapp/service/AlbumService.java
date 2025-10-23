package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.AlbumDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.model.Album;
import com.vibemine.musicapp.repository.AlbumRepository;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest; // Thêm import
import org.springframework.data.domain.Pageable; // Thêm import
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService;
    private final ArtistService artistService; // Đảm bảo ArtistService đã được @Autowired (do @RequiredArgsConstructor)

    // --- THÊM MỚI ---
    // Lấy tất cả album (phân trang)
    public List<AlbumDTO> getAllAlbums(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return albumRepository.findAll(pageable).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    // --- KẾT THÚC THÊM MỚI ---

    // FR-6.4: Lấy thông tin Album
    public AlbumDTO getAlbum(Long albumId) {
        return albumRepository.findById(albumId)
                .map(this::toDTO)
                .orElse(null); // Trả về null nếu không tìm thấy
    }

    // FR-6.4: Lấy danh sách tracks của Album
    public List<TrackResponseDTO> getAlbumTracks(Long albumId) {
        return trackRepository.findByAlbum_Id(albumId)
                .stream()
                .map(track -> trackService.toResponseDTO(track)) // Dùng lambda
                .collect(Collectors.toList());
    }

    // Hàm chuyển đổi (giữ nguyên)
    private AlbumDTO toDTO(Album album) {
        if (album == null) return null;
        AlbumDTO dto = new AlbumDTO();
        dto.setId(album.getId());
        dto.setTitle(album.getTitle());
        dto.setCoverArtUrl(album.getCoverArtUrl());
        dto.setReleaseYear(album.getReleaseYear());
        
        if (album.getArtist() != null) {
            // Gọi ArtistService để chuyển đổi Artist sang ArtistDTO
            // Giả sử ArtistService có hàm public `toDTO` hoặc `getArtist`
            dto.setArtist(artistService.getArtist(album.getArtist().getId()));
        }
        return dto;
    }
}