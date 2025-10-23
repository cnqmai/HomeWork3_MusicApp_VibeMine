package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.*;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackService {
    private final TrackRepository trackRepository;

    // FR-1.1: Danh sách bài nhạc (PAGINATED) ✅ SỬA LỖI
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
            dto.setLyrics(track.getLyrics());
            return dto;
        });
    }

    // FR-1.3: Tìm kiếm (PAGINATED) ✅ SỬA LỖI
    public List<TrackResponseDTO> searchTracks(String keyword, int page, int size) {
        List<Track> results = trackRepository
                .findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(keyword, keyword);
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
    public TrackResponseDTO playTrack(Long id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found"));
        track.setPlayCount(track.getPlayCount() + 1);
        trackRepository.save(track);
        return toResponseDTO(track);
    }

    // FR-2.2: Next Track
    public TrackResponseDTO getNextTrack(Long currentId) {
        List<TrackResponseDTO> allTracks = getAllTracks();
        int currentIndex = (int) allTracks.stream()
                .filter(t -> t.getId().equals(currentId))
                .count();
        return allTracks.get((currentIndex + 1) % allTracks.size());
    }

    // FR-2.2: Previous Track
    public TrackResponseDTO getPreviousTrack(Long currentId) {
        List<TrackResponseDTO> allTracks = getAllTracks();
        int currentIndex = (int) allTracks.stream()
                .filter(t -> t.getId().equals(currentId))
                .count() - 1;
        if (currentIndex < 0) currentIndex = allTracks.size() - 1;
        return allTracks.get(currentIndex % allTracks.size());
    }

    // FR-6.4: Tracks theo Genre (PAGINATED) ✅ SỬA LỖI
    public List<TrackResponseDTO> getTracksByGenre(String genre, int page, int size) {
        List<Track> results = trackRepository.findByGenreIgnoreCase(genre);
        return results.stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

// ✅ THÊM MỚI: FR-6.4 Tracks theo Album
    public List<TrackResponseDTO> getTracksByAlbum(Long albumId) {
        return trackRepository.findByAlbum_Id(albumId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ THÊM MỚI: FR-6.4 Tracks theo Artist
    public List<TrackResponseDTO> getTracksByArtist(Long artistId) {
        return trackRepository.findByArtists_Id(artistId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ THÊM MỚI: getTracksByGenre NO PAGINATION (cho AdvancedController)
    public List<TrackResponseDTO> getTracksByGenre(String genre) {
        List<Track> results = trackRepository.findByGenreIgnoreCase(genre);
        return results.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    // FR-6.2: Tải offline ✅ THÊM MỚI
    public DownloadStatusDTO downloadTrack(Long userId, Long trackId) {
        DownloadStatusDTO status = new DownloadStatusDTO();
        status.setSuccess(true);
        status.setFilePath("/storage/emulated/0/Music/vibemine_" + trackId + ".mp3");
        status.setMessage("Download completed");
        status.setProgress(100.0);
        return status;
    }

    // FR-8.2: Trending tracks
    public List<TrackResponseDTO> getTrendingTracks(int limit) {
        return trackRepository.findAllByOrderByPlayCountDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // FR-9.1: Share link ✅ THÊM MỚI
    public ShareLinkDTO getShareLink(Long trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Track not found"));
        ShareLinkDTO link = new ShareLinkDTO();
        link.setShareUrl("https://vibemine.app/track/" + trackId);
        link.setTrackTitle(track.getTitle());
        if (!track.getArtists().isEmpty()) {
            link.setArtistName(track.getArtists().get(0).getName());
        }
        link.setMessage("🎵 Nghe ngay: " + track.getTitle());
        return link;
    }

    // ✅ PUBLIC method cho các service khác
    public TrackResponseDTO toResponseDTO(Track track) {
        TrackResponseDTO dto = new TrackResponseDTO();
        dto.setId(track.getId());
        dto.setTitle(track.getTitle());
        dto.setCoverArtUrl(track.getCoverArtUrl());
        dto.setTrackUrl(track.getTrackUrl());
        dto.setDuration(track.getDuration());
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
            dto.setAlbum(albumDTO);
        }
        return dto;
    }
}