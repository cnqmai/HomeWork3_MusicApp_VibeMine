package com.vibemine.musicapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "play_history")
@Data @NoArgsConstructor @AllArgsConstructor
public class PlayHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;        // FR-8.3
    private Long trackId;       // FR-8.1
    private LocalDateTime playedAt;
}