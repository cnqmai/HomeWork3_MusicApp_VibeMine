package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.*;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.model.Artist; // --- SỬA LỖI: Thêm import này ---
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class TrackService {
    private final TrackRepository trackRepository;
    private final AlbumService albumService;
    private final ArtistService artistService;
    private final PlayHistoryService playHistoryService; // Inject HistoryService

    // FR-1.1: Danh sách bài nhạc (PAGINATED)
    public List<TrackResponseDTO> getAllTracks(Pageable pageable) {
        Slice<Track> tracks = trackRepository.findAll(pageable);
        return tracks.getContent().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-1.1: Danh sách bài nhạc (NO PAGINATION - Giới hạn 50)
    public List<TrackResponseDTO> getAllTracks() {
        return trackRepository.findAll(PageRequest.of(0, 50)).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

     // FR-1.2: Chi tiết bài hát
    @Transactional(readOnly = true)
    public Optional<TrackDetailDTO> getTrackDetail(Long id) {
        return trackRepository.findById(id).map(track -> {
            TrackDetailDTO dto = new TrackDetailDTO();
            dto.setTrack(toResponseDTO(track));
            dto.setLyrics(track.getLyrics());
             if (track.getAlbum() != null) {
                dto.setAlbum(albumService.getAlbum(track.getAlbum().getId()));
            }
            return dto;
        });
    }

     // FR-1.3: Tìm kiếm (PAGINATED)
    public List<TrackResponseDTO> searchTracks(String keyword, int page, int size) {
        List<Track> results = trackRepository
                .findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(keyword, keyword);
        int startIndex = page * size;
        if (startIndex >= results.size()) {
            return List.of();
        }
        int endIndex = Math.min(startIndex + size, results.size());
        return results.subList(startIndex, endIndex).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-1.3: Tìm kiếm (NO PAGINATION - Giới hạn 50)
    public List<TrackResponseDTO> searchTracks(String keyword) {
        return trackRepository
                .findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(keyword, keyword)
                .stream()
                .limit(50)
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-2.1 & FR-8.3: Play track (log history)
    @Transactional
    public TrackResponseDTO playTrack(Long userId, Long trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Track not found: " + trackId));
        
        track.setPlayCount(track.getPlayCount() + 1);
        trackRepository.save(track);
        
        playHistoryService.logPlayHistory(userId, trackId);
        
        return toResponseDTO(track);
    }

    // FR-2.2: Next Track
    public TrackResponseDTO getNextTrack(Long currentId) {
        Optional<Track> nextTrackOpt = trackRepository.findFirstByIdGreaterThanOrderByIdAsc(currentId);
        Track nextTrack = nextTrackOpt.orElseGet(() ->
            trackRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new NoSuchElementException("No tracks found to determine the first track"))
        );
        return toResponseDTO(nextTrack);
    }

    // FR-2.2: Previous Track
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
         int startIndex = page * size;
        if (startIndex >= results.size()) {
            return List.of();
        }
        int endIndex = Math.min(startIndex + size, results.size());
        return results.subList(startIndex, endIndex).stream()
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

     // getTracksByGenre NO PAGINATION (Giới hạn 50)
    public List<TrackResponseDTO> getTracksByGenre(String genre) {
        List<Track> results = trackRepository.findByGenreIgnoreCase(genre);
        return results.stream()
                .limit(50)
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-6.2: Tải offline (Mocked)
    public DownloadStatusDTO downloadTrack(Long userId, Long trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Track not found: " + trackId));

        DownloadStatusDTO status = new DownloadStatusDTO();
        status.setSuccess(true);
        String safeTitle = track.getTitle() != null ? track.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") : "unknown_title";
        String fileExtension = "mp3";
        if (track.getTrackUrl() != null && track.getTrackUrl().contains(".")) {
             String[] parts = track.getTrackUrl().split("\\.");
             if (parts.length > 1) fileExtension = parts[parts.length - 1];
        }
        String fileName = "vibemine_" + track.getId() + "_" + safeTitle + "." + fileExtension;
        status.setFilePath("/local/path/placeholder/" + fileName);
        status.setMessage("Download initiated for " + track.getTitle());
        status.setProgress(0.0);

        return status;
    }

    // FR-8.2: Trending tracks
    public List<TrackResponseDTO> getTrendingTracks(int limit) {
        if (limit <= 0) limit = 10;
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
        // --- SỬA LỖI: Sử dụng Artist::getName đúng cách ---
        if (track.getArtists() != null && !track.getArtists().isEmpty()) {
            artistName = track.getArtists().stream()
                            .map(Artist::getName) // Giờ đã có thể dùng vì đã import Artist
                            .collect(Collectors.joining(", "));
        }
        // --- KẾT THÚC SỬA LỖI ---
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
                    .map(artistService::toDTO) // Sử dụng hàm toDTO của ArtistService
                    .collect(Collectors.toList()));
        }

        if (track.getAlbum() != null) {
            AlbumDTO albumDTO = new AlbumDTO();
            albumDTO.setId(track.getAlbum().getId());
            albumDTO.setTitle(track.getAlbum().getTitle());
            albumDTO.setCoverArtUrl(track.getAlbum().getCoverArtUrl());
            dto.setAlbum(albumDTO);
        }
        return dto;
    }
}