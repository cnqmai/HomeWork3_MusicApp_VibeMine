package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.model.UserFavorite;
import com.vibemine.musicapp.repository.TrackRepository;
import com.vibemine.musicapp.repository.UserFavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserFavoriteService {
    private final UserFavoriteRepository userFavoriteRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService;

    // FR-3.1: Thêm vào yêu thích
    @Transactional
    public boolean addToFavorites(Long userId, Long trackId) {
        if (userFavoriteRepository.existsByUserIdAndTrackId(userId, trackId)) {
            return false; // Đã có trong favorites
        }
        
        UserFavorite favorite = new UserFavorite();
        favorite.setUserId(userId);
        favorite.setTrackId(trackId);
        favorite.setAddedAt(LocalDateTime.now());
        userFavoriteRepository.save(favorite);
        
        // Tăng favorite count
        trackRepository.findById(trackId).ifPresent(track -> {
            track.setFavoriteCount(track.getFavoriteCount() + 1);
            trackRepository.save(track);
        });
        
        return true;
    }

    // FR-3.1: Xóa khỏi yêu thích
    @Transactional
    public boolean removeFromFavorites(Long userId, Long trackId) {
        if (!userFavoriteRepository.existsByUserIdAndTrackId(userId, trackId)) {
            return false; // Không tồn tại
        }
        
        userFavoriteRepository.deleteByUserIdAndTrackId(userId, trackId);
        
        // Giảm favorite count
        trackRepository.findById(trackId).ifPresent(track -> {
            if (track.getFavoriteCount() > 0) {
                track.setFavoriteCount(track.getFavoriteCount() - 1);
                trackRepository.save(track);
            }
        });
        
        return true;
    }

    // FR-3.4: Lấy danh sách favorites
    public List<TrackResponseDTO> getUserFavorites(Long userId) {
        return userFavoriteRepository.findByUserId(userId).stream()
            .map(fav -> trackService.toResponseDTO(trackRepository.findById(fav.getTrackId()).orElse(null)))
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
    }
}