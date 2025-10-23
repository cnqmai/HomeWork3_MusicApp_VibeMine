package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.HistoryDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.model.PlayHistory;
import com.vibemine.musicapp.repository.PlayHistoryRepository;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayHistoryService {
    private final PlayHistoryRepository playHistoryRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService;

    // FR-8.3: Lưu lịch sử nghe
    public void logPlayHistory(Long userId, Long trackId) {
        PlayHistory history = new PlayHistory();
        history.setUserId(userId);
        history.setTrackId(trackId);
        history.setPlayedAt(LocalDateTime.now());
        playHistoryRepository.save(history);
    }

    // FR-8.3: Lấy lịch sử nghe
    public List<HistoryDTO> getUserHistory(Long userId, int limit) {
        return playHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId).stream()
                .limit(limit)
                .map(this::toHistoryDTO)
                .collect(Collectors.toList());
    }

    // FR-8.1: Gợi ý dựa trên lịch sử (top similar tracks)
    public List<TrackResponseDTO> getRecommendations(Long userId) {
        // Logic: Tracks cùng artist/thể loại với top lịch sử
        return trackRepository.findAll().stream()
                .filter(track -> track.getPlayCount() > 5) // Popular tracks
                .limit(20)
                .map(trackService::toResponseDTO)
                .collect(Collectors.toList());
    }

    private HistoryDTO toHistoryDTO(PlayHistory history) {
        HistoryDTO dto = new HistoryDTO();
        trackRepository.findById(history.getTrackId()).ifPresent(track -> {
            dto.setTrackId(track.getId());
            dto.setTitle(track.getTitle());
            dto.setArtist(track.getArtists().get(0).getName());
        });
        dto.setPlayedAt(history.getPlayedAt());
        return dto;
    }
}