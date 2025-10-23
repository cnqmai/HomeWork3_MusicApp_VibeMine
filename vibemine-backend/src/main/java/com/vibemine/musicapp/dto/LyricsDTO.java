package com.vibemine.musicapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class LyricsDTO {
    private String fullLyrics;
    private List<LyricLineDTO> syncedLyrics;
}

@Data
class LyricLineDTO {
    private String text;
    private double startTime; // seconds
    private double endTime;
}