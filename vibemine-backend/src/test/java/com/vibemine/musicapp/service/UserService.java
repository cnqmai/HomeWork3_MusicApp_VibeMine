// src/main/java/com/vibemine/musicapp/service/UserService.java

package com.vibemine.musicapp.service;

import com.vibemine.musicapp.model.User;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.model.Playlist;
import com.vibemine.musicapp.model.ListeningHistory;
import com.vibemine.musicapp.repository.UserRepository;
import com.vibemine.musicapp.repository.TrackRepository;
import com.vibemine.musicapp.repository.PlaylistRepository;
import com.vibemine.musicapp.repository.ListeningHistoryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final PlaylistRepository playlistRepository;
    private final ListeningHistoryRepository historyRepository;

    public UserService(UserRepository userRepository, TrackRepository trackRepository, PlaylistRepository playlistRepository, ListeningHistoryRepository historyRepository) {
        this.userRepository = userRepository;
        this.trackRepository = trackRepository;
        this.playlistRepository = playlistRepository;
        this.historyRepository = historyRepository;
    }

    // --- Chức năng Yêu thích (FR-3.1, FR-3.4) ---

    /**
     * Thêm/Xóa bài hát khỏi danh sách Yêu thích.
     */
    public User toggleFavorite(Long userId, Long trackId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        Track track = trackRepository.findById(trackId)
            .orElseThrow(() -> new RuntimeException("Bài hát không tồn tại"));

        if (user.getFavoriteTracks().contains(track)) {
            // Xóa khỏi danh sách yêu thích
            user.getFavoriteTracks().remove(track);
            track.setFavoriteCount(track.getFavoriteCount() - 1);
        } else {
            // Thêm vào danh sách yêu thích (FR-3.1)
            user.getFavoriteTracks().add(track);
            track.setFavoriteCount(track.getFavoriteCount() + 1);
        }
        
        trackRepository.save(track);
        return userRepository.save(user);
    }
    
    /**
     * Lấy danh sách Yêu thích của người dùng (FR-3.4)
     */
    public List<Track> getFavoriteTracks(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return user.getFavoriteTracks().stream().toList();
    }

    // --- Chức năng Playlist (FR-3.2, FR-3.3, FR-3.4) ---
    
    /**
     * Tạo Playlist mới (FR-3.2)
     */
    public Playlist createPlaylist(Long userId, String playlistName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        Playlist newPlaylist = new Playlist(null, playlistName, user, null, null);
        return playlistRepository.save(newPlaylist);
    }
    
    /**
     * Lấy tất cả Playlist của User (FR-3.4)
     */
    public List<Playlist> getUserPlaylists(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return playlistRepository.findByUser(user);
    }
    
    /**
     * Thêm bài hát vào Playlist (FR-3.3)
     */
    public Playlist addTrackToPlaylist(Long userId, Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist không tồn tại"));
        
        // Đảm bảo chỉ chủ sở hữu mới được chỉnh sửa
        if (!playlist.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền chỉnh sửa Playlist này");
        }
        
        Track track = trackRepository.findById(trackId)
            .orElseThrow(() -> new RuntimeException("Bài hát không tồn tại"));
        
        // Thêm bài hát vào cuối playlist nếu chưa tồn tại
        if (!playlist.getTracks().contains(track)) {
            playlist.getTracks().add(track);
        }
        return playlistRepository.save(playlist);
    }

    // TODO: Triển khai xóa bài hát khỏi Playlist (FR-3.3)
    // TODO: Triển khai xóa Playlist

    // --- Chức năng Lịch sử & Gợi ý (FR-8.1, FR-8.3) ---
    
    /**
     * Ghi lại lịch sử nghe nhạc (FR-8.3).
     * @param userId
     * @param trackId
     */
    public void logListenHistory(Long userId, Long trackId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        Track track = trackRepository.findById(trackId)
            .orElseThrow(() -> new RuntimeException("Bài hát không tồn tại"));
            
        ListeningHistory history = new ListeningHistory(null, user, track, null);
        historyRepository.save(history);
        
        // Tùy chọn: Gọi TrackService để tăng playCount (đã làm trong getTrackById)
    }
    
    /**
     * Lấy lịch sử nghe của người dùng (FR-8.3).
     */
    public List<ListeningHistory> getListeningHistory(Long userId) {
         User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        Pageable top100 = PageRequest.of(0, 100);
        return historyRepository.findByUserOrderByListenedAtDesc(user, top100);
    }

    // TODO: Triển khai logic gợi ý phức tạp (FR-8.1), dựa trên lịch sử nghe (ví dụ: gợi ý nghệ sĩ/thể loại tương tự)
}