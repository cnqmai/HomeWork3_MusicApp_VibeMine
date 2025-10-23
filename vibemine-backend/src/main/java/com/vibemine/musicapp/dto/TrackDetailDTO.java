package com.vibemine.musicapp.dto;

import lombok.Data;

@Data
public class TrackDetailDTO {
    private TrackResponseDTO track;
    private String lyrics;      // FR-6.1
    private AlbumDTO album;
}