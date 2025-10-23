package com.vibemine.musicapp.service;

import com.vibemine.musicapp.model.PlayHistory;
import com.vibemine.musicapp.repository.PlayHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayHistoryService {
    private final PlayHistoryRepository playHistoryRepository;

    // FR-8.3: Lưu lịch sử nghe
    public void logPlayHistory(Long userId, Long trackId) {
        PlayHistory history = new PlayHistory();
        history.setUserId(userId);
        history.setTrackId(trackId);
        history.setPlayedAt(LocalDateTime.now());
        playHistoryRepository.save(history);
    }

    // FR-8.3: Lấy lịch sử nghe
    public List<Long> getUserHistory(Long userId, int limit) {
        return playHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId)
                .stream()
                .limit(limit)
                .map(PlayHistory::getTrackId)
                .collect(Collectors.toList());
    }

    // FR-8.1: Gợi ý dựa trên lịch sử
    public List<Long> getRecommendations(Long userId) {
        List<Object[]> topTracks = playHistoryRepository.findTopTracksByUserId(userId);
        return topTracks.stream()
                .map(obj -> (Long) obj[0])
                .limit(20)
                .collect(Collectors.toList());
    }
}