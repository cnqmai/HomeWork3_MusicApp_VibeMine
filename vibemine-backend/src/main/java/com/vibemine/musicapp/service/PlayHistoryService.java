package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.HistoryDTO;
import com.vibemine.musicapp.dto.TrackResponseDTO;
import com.vibemine.musicapp.model.Artist;
import com.vibemine.musicapp.model.PlayHistory;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.repository.PlayHistoryRepository;
import com.vibemine.musicapp.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PlayHistoryService {
    private final PlayHistoryRepository playHistoryRepository;
    private final TrackRepository trackRepository;
    private final TrackService trackService; // TrackService sẽ được inject (do @RequiredArgsConstructor)

    // FR-8.3: Lưu lịch sử nghe
    public void logPlayHistory(Long userId, Long trackId) {
        // Kiểm tra track tồn tại trước khi log
        if (!trackRepository.existsById(trackId)) {
            return; // Không log nếu track không tồn tại
        }
        PlayHistory history = new PlayHistory();
        history.setUserId(userId);
        history.setTrackId(trackId);
        history.setPlayedAt(LocalDateTime.now());
        playHistoryRepository.save(history);
    }

    // FR-8.3: Lấy lịch sử nghe
    public List<HistoryDTO> getUserHistory(Long userId, int limit) {
        return playHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId).stream()
                .limit(limit > 0 ? limit : 50) // Đảm bảo limit hợp lệ
                .map(this::toHistoryDTO)
                .filter(Objects::nonNull) // Lọc bỏ track đã bị xóa
                .collect(Collectors.toList());
    }

    // FR-8.1: Gợi ý dựa trên lịch sử (LOGIC ĐƯỢC CẢI THIỆN)
    public List<TrackResponseDTO> getRecommendations(Long userId) {
        // 1. Lấy danh sách 5 trackId user nghe nhiều nhất
        List<Long> topTrackIds = playHistoryRepository.findTopTrackIdsByUserId(userId).stream()
                .limit(5)
                .map(result -> (Long) result[0])
                .collect(Collectors.toList());

        // 2. Nếu không có lịch sử, trả về trending
        if (topTrackIds.isEmpty()) {
            return trackService.getTrendingTracks(20); // Lấy 20 bài trending
        }

        // 3. Lấy tất cả trackId user đã nghe để loại trừ
        Set<Long> allListenedTrackIds = playHistoryRepository.findAllTrackIdsByUserId(userId);

        // 4. Lấy thông tin (Genre, Artist) từ 5 track top
        List<Track> topTracks = trackRepository.findAllById(topTrackIds);
        
        // Đếm tần suất Genre
        Map<String, Long> genreCounts = topTracks.stream()
                .map(Track::getGenre)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        
        // Đếm tần suất Artist
        Map<Artist, Long> artistCounts = topTracks.stream()
                .flatMap(track -> track.getArtists() != null ? track.getArtists().stream() : Stream.empty())
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        // 5. Tìm Genre và Artist yêu thích nhất
        Optional<String> favoriteGenre = genreCounts.isEmpty() ? Optional.empty() : 
            Optional.of(Collections.max(genreCounts.entrySet(), Map.Entry.comparingByValue()).getKey());
            
        Optional<Long> favoriteArtistId = artistCounts.isEmpty() ? Optional.empty() : 
            Optional.of(Collections.max(artistCounts.entrySet(), Map.Entry.comparingByValue()).getKey().getId());

        // 6. Lấy bài hát gợi ý
        List<Track> recommendedTracks = new ArrayList<>();

        // Gợi ý theo Genre (lấy 10 bài)
        favoriteGenre.ifPresent(genre -> recommendedTracks.addAll(
            trackRepository.findByGenreIgnoreCaseAndIdNotIn(
                genre, 
                allListenedTrackIds, 
                PageRequest.of(0, 10)
            )
        ));

        // Gợi ý theo Artist (lấy 10 bài)
        favoriteArtistId.ifPresent(artistId -> recommendedTracks.addAll(
            trackRepository.findByArtists_IdAndIdNotIn(
                artistId, 
                allListenedTrackIds, 
                PageRequest.of(0, 10)
            )
        ));
        
        // 7. Nếu vẫn không đủ, thêm trending (chưa nghe)
        if (recommendedTracks.size() < 20) {
             List<Track> trendingTracks = trackRepository.findAllByOrderByPlayCountDesc(PageRequest.of(0, 40)); // Lấy nhiều hơn
             trendingTracks.stream()
                .filter(track -> !allListenedTrackIds.contains(track.getId())) // Lọc bài chưa nghe
                .forEach(recommendedTracks::add);
        }

        // 8. Trộn, lọc trùng lặp, giới hạn 20 bài và chuyển sang DTO
        return recommendedTracks.stream()
                .distinct() // Loại bỏ trùng lặp
                .limit(20)
                .map(trackService::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Chuyển PlayHistory sang HistoryDTO
    private HistoryDTO toHistoryDTO(PlayHistory history) {
        Optional<Track> trackOpt = trackRepository.findById(history.getTrackId());
        if (trackOpt.isEmpty()) {
            return null; // Trả về null nếu track không còn tồn tại
        }
        Track track = trackOpt.get();
        HistoryDTO dto = new HistoryDTO();
        dto.setTrackId(track.getId());
        dto.setTitle(track.getTitle());
        if (track.getArtists() != null && !track.getArtists().isEmpty()) {
            dto.setArtist(track.getArtists().get(0).getName());
        } else {
            dto.setArtist("Unknown Artist");
        }
        dto.setPlayedAt(history.getPlayedAt());
        return dto;
    }
}