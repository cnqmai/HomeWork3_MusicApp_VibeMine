// src/main/java/com/vibemine/musicapp/model/Track.java

package com.vibemine.musicapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;          // Tên bài hát (FR-1.2)
    private String artist;         // Tên ca sĩ (FR-1.2, FR-1.3, FR-6.4)
    private String album;          // Album (FR-6.4)
    private String genre;          // Thể loại (FR-6.4)
    private String coverArtUrl;    // Đường dẫn ảnh bìa (FR-1.2)
    private String trackUrl;       // Đường dẫn file nhạc (cho streaming/download) (FR-2.5, FR-6.2)
    private String lyrics;         // Lời bài hát (FR-6.1)
    private Long duration;         // Tổng thời lượng bài hát (FR-2.4)
    private boolean isTrending;    // Nhạc xu hướng (FR-8.2)

    // Dùng để đếm số lần yêu thích/nghe để tính toán thống kê, gợi ý (FR-8.1, FR-8.2)
    private Long playCount = 0L; 
    private Long favoriteCount = 0L; 
}