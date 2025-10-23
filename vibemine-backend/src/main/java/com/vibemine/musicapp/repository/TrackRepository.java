package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Track;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional; // Đảm bảo import này tồn tại

public interface TrackRepository extends JpaRepository<Track, Long> {
    // FR-1.3
    List<Track> findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(
        String title, String artistName);

    // FR-8.2
    List<Track> findAllByOrderByPlayCountDesc(Pageable pageable);

    // FR-6.4
    List<Track> findByGenreIgnoreCase(String genre);

    // FR-6.4: Tracks theo Artist
    List<Track> findByArtists_Id(Long artistId);

    // FR-6.4: Tracks theo Album
    List<Track> findByAlbum_Id(Long albumId);

    // --- PHẦN THÊM MỚI ĐỂ TỐI ƯU NEXT/PREVIOUS ---
    // Lấy bài hát có ID lớn hơn gần nhất
    Optional<Track> findFirstByIdGreaterThanOrderByIdAsc(Long currentId);

    // Lấy bài hát có ID nhỏ hơn gần nhất (sắp xếp giảm dần để lấy top 1)
    Optional<Track> findFirstByIdLessThanOrderByIdDesc(Long currentId);

    // Lấy bài hát đầu tiên (nếu đang ở cuối danh sách)
    Optional<Track> findFirstByOrderByIdAsc();

    // Lấy bài hát cuối cùng (nếu đang ở đầu danh sách)
    Optional<Track> findFirstByOrderByIdDesc();
    // --- KẾT THÚC PHẦN THÊM MỚI ---
}