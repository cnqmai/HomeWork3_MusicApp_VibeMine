package com.vibemine.musicapp.model;

import jakarta.persistence.*; // Đảm bảo import đầy đủ
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "track")
@Data @NoArgsConstructor @AllArgsConstructor
public class Track {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;           // FR-1.2
    private String genre;
    private String coverArtUrl;     // FR-1.2
    private String trackUrl;        // FR-2.1

    @Column(columnDefinition = "TEXT") // <-- THÊM DÒNG NÀY
    private String lyrics;          // FR-6.1

    private Long duration;          // FR-2.4
    private Long playCount = 0L;
    private Long favoriteCount = 0L;
    private boolean isTrending;

    @ManyToMany
    @JoinTable(name = "track_artists",
        joinColumns = @JoinColumn(name = "track_id"),
        inverseJoinColumns = @JoinColumn(name = "artist_id"))
    private List<Artist> artists;   // FR-1.2

    @ManyToOne @JoinColumn(name = "album_id")
    private Album album;            // FR-6.4
}