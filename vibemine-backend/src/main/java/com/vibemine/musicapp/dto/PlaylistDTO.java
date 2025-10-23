package com.vibemine.musicapp.dto;

import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

@Data
public class PlaylistDTO {
    private Long id;
    private String name;            // FR-3.2
    private Long userId;            // FR-3.4
    private LocalDateTime createdAt;
    private List<TrackResponseDTO> tracks; // FR-3.3
}