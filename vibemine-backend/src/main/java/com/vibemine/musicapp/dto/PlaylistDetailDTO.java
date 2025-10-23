package com.vibemine.musicapp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PlaylistDetailDTO {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private List<TrackResponseDTO> tracks;
}