package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.*;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

// Thêm import cho FileSystem và Paths nếu triển khai tải file thực tế
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
// import org.springframework.beans.factory.annotation.Value; // Để inject upload-dir

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class TrackService {
    private final TrackRepository trackRepository;
    // Inject PlayHistoryService nếu cần log history (sẽ làm sau)
    // private final PlayHistoryService playHistoryService;

    // Lấy đường dẫn thư mục uploads từ application.properties (nếu cần tải thực tế)
    // @Value("${file.upload-dir}")
    // private String uploadDir;

    // FR-1.1: Danh sách bài nhạc (PAGINATED)
    public List<TrackResponseDTO> getAllTracks(Pageable pageable) {
        Slice<Track> tracks = trackRepository.findAll(pageable);
        return tracks.getContent().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-1.1: Danh sách bài nhạc (NO PAGINATION)
    public List<TrackResponseDTO> getAllTracks() {
        return trackRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

     // FR-1.2: Chi tiết bài hát
    public Optional<TrackDetailDTO> getTrackDetail(Long id) {
        return trackRepository.findById(id).map(track -> {
            TrackDetailDTO dto = new TrackDetailDTO();
            dto.setTrack(toResponseDTO(track));
            dto.setLyrics(track.getLyrics()); // Trả về chuỗi LRC
             if (track.getAlbum() != null) {
                AlbumDTO albumDTO = new AlbumDTO();
                albumDTO.setId(track.getAlbum().getId());
                albumDTO.setTitle(track.getAlbum().getTitle());
                albumDTO.setCoverArtUrl(track.getAlbum().getCoverArtUrl());
                albumDTO.setReleaseYear(track.getAlbum().getReleaseYear());
                dto.setAlbum(albumDTO);
            }
            return dto;
        });
    }

     // FR-1.3: Tìm kiếm (PAGINATED)
    public List<TrackResponseDTO> searchTracks(String keyword, int page, int size) {
        List<Track> results = trackRepository
                .findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(keyword, keyword);
        // Logic phân trang này không tối ưu cho dữ liệu lớn, nên dùng Pageable trong repo
        return results.stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-1.3: Tìm kiếm (NO PAGINATION)
    public List<TrackResponseDTO> searchTracks(String keyword) {
        return trackRepository
                .findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-2.1: Play track (tăng play count + log history)
    // *** CẦN BỔ SUNG GỌI HÀM LOG HISTORY Ở ĐÂY (SẼ LÀM Ở BƯỚC SAU) ***
    public TrackResponseDTO playTrack(Long id /*, Long userId */) { // Sẽ cần userId khi log history
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found: " + id));
        track.setPlayCount(track.getPlayCount() + 1);
        trackRepository.save(track);
        // playHistoryService.logPlayHistory(userId, id); // Sẽ thêm dòng này
        return toResponseDTO(track);
    }

    // FR-2.2: Next Track (ĐÃ TỐI ƯU HÓA)
    public TrackResponseDTO getNextTrack(Long currentId) {
        Optional<Track> nextTrackOpt = trackRepository.findFirstByIdGreaterThanOrderByIdAsc(currentId);
        Track nextTrack = nextTrackOpt.orElseGet(() ->
            trackRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new NoSuchElementException("No tracks found to determine the first track"))
        );
        return toResponseDTO(nextTrack);
    }

    // FR-2.2: Previous Track (ĐÃ TỐI ƯU HÓA)
    public TrackResponseDTO getPreviousTrack(Long currentId) {
        Optional<Track> prevTrackOpt = trackRepository.findFirstByIdLessThanOrderByIdDesc(currentId);
        Track prevTrack = prevTrackOpt.orElseGet(() ->
            trackRepository.findFirstByOrderByIdDesc()
                .orElseThrow(() -> new NoSuchElementException("No tracks found to determine the last track"))
        );
        return toResponseDTO(prevTrack);
    }

    // FR-6.4: Tracks theo Genre (PAGINATED)
    public List<TrackResponseDTO> getTracksByGenre(String genre, int page, int size) {
        List<Track> results = trackRepository.findByGenreIgnoreCase(genre);
        return results.stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-6.4 Tracks theo Album
    public List<TrackResponseDTO> getTracksByAlbum(Long albumId) {
        return trackRepository.findByAlbum_Id(albumId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-6.4 Tracks theo Artist
    public List<TrackResponseDTO> getTracksByArtist(Long artistId) {
        return trackRepository.findByArtists_Id(artistId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

     // getTracksByGenre NO PAGINATION
    public List<TrackResponseDTO> getTracksByGenre(String genre) {
        List<Track> results = trackRepository.findByGenreIgnoreCase(genre);
        return results.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-6.2: Tải offline (Cập nhật - Kiểm tra Track tồn tại, vẫn Mocked)
    public DownloadStatusDTO downloadTrack(Long userId, Long trackId) {
        // 1. Kiểm tra xem track có tồn tại không
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Track not found: " + trackId));

        // 2. (Logic thực tế sẽ ở đây)
        // ...

        // 3. Giữ nguyên Mocked Response (giả lập thành công)
        DownloadStatusDTO status = new DownloadStatusDTO();
        status.setSuccess(true);
        // Tạo tên file an toàn hơn
        String safeTitle = track.getTitle() != null ? track.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") : "unknown_title";
        String fileExtension = "mp3"; // Mặc định hoặc lấy từ track.getTrackUrl() nếu có
        if (track.getTrackUrl() != null && track.getTrackUrl().contains(".")) {
             String[] parts = track.getTrackUrl().split("\\.");
             if (parts.length > 1) {
                 fileExtension = parts[parts.length - 1];
             }
        }
        String fileName = "vibemine_" + track.getId() + "_" + safeTitle + "." + fileExtension;
        status.setFilePath("/local/path/placeholder/" + fileName); // Đường dẫn giả lập
        status.setMessage("Download initiated for " + track.getTitle()); // Thông báo bắt đầu
        status.setProgress(0.0); // Bắt đầu từ 0%

        return status;
    }

    // FR-8.2: Trending tracks
    public List<TrackResponseDTO> getTrendingTracks(int limit) {
        if (limit <= 0) {
            limit = 10;
        }
        return trackRepository.findAllByOrderByPlayCountDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-9.1: Share link
    public ShareLinkDTO getShareLink(Long trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Track not found: " + trackId));
        ShareLinkDTO link = new ShareLinkDTO();
        link.setShareUrl("https://vibemine.app/track/" + trackId); // Cần URL thực tế
        link.setTrackTitle(track.getTitle());
        String artistName = "Unknown Artist";
        if (track.getArtists() != null && !track.getArtists().isEmpty()) {
            artistName = track.getArtists().get(0).getName();
        }
        link.setArtistName(artistName);
        link.setMessage("🎵 Nghe ngay bài hát tuyệt vời này: " + track.getTitle() + " - " + artistName);
        return link;
    }

    // toResponseDTO (Chuyển đổi Track -> TrackResponseDTO)
     public TrackResponseDTO toResponseDTO(Track track) {
        if (track == null) {
            return null;
        }
        TrackResponseDTO dto = new TrackResponseDTO();
        dto.setId(track.getId());
        dto.setTitle(track.getTitle());
        dto.setCoverArtUrl(track.getCoverArtUrl());
        dto.setTrackUrl(track.getTrackUrl());
        dto.setDuration(track.getDuration()); // Duration giờ là milliseconds
        dto.setPlayCount(track.getPlayCount());
        dto.setFavoriteCount(track.getFavoriteCount());
        dto.setTrending(track.isTrending());

        if (track.getArtists() != null && !track.getArtists().isEmpty()) {
            dto.setArtists(track.getArtists().stream()
                    .map(a -> {
                        ArtistDTO adto = new ArtistDTO();
                        adto.setId(a.getId());
                        adto.setName(a.getName());
                        adto.setAvatarUrl(a.getAvatarUrl());
                        return adto;
                    }).collect(Collectors.toList()));
        }

        if (track.getAlbum() != null) {
            AlbumDTO albumDTO = new AlbumDTO();
            albumDTO.setId(track.getAlbum().getId());
            albumDTO.setTitle(track.getAlbum().getTitle());
            albumDTO.setCoverArtUrl(track.getAlbum().getCoverArtUrl());
            // Không set artist cho album ở đây nữa để tránh dư thừa
            dto.setAlbum(albumDTO);
        }
        return dto;
    }
}