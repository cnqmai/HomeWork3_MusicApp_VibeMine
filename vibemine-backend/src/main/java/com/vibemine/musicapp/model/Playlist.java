package com.vibemine.musicapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "playlist")
@Data @NoArgsConstructor @AllArgsConstructor
public class Playlist {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;        // FR-3.2
    private Long userId;        // FR-3.4
    private LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(name = "playlist_tracks",
        joinColumns = @JoinColumn(name = "playlist_id"),
        inverseJoinColumns = @JoinColumn(name = "track_id"))
    private List<Track> tracks; // FR-3.3
}