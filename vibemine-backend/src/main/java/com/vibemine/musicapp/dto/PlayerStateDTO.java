package com.vibemine.musicapp.dto;

import lombok.Data;

@Data
public class PlayerStateDTO {
    private String sessionId;
    private String repeatMode;  // "none", "one", "all" - FR-7.1
    private boolean shuffle;    // FR-7.2
    private double volume;      // FR-7.3
}