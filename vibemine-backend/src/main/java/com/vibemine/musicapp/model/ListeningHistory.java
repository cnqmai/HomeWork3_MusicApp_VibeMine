// src/main/java/com/vibemine/musicapp/model/ListeningHistory.java

package com.vibemine.musicapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListeningHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne 
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Người dùng đã nghe (FR-8.3)
    
    @ManyToOne
    @JoinColumn(name = "track_id", nullable = false)
    private Track track; // Bài hát đã nghe

    private LocalDateTime listenedAt = LocalDateTime.now(); // Thời điểm nghe
}