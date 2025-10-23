package com.vibemine.musicapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HistoryDTO {
    private Long trackId;
    private String title;
    private String artist;
    private LocalDateTime playedAt;
}