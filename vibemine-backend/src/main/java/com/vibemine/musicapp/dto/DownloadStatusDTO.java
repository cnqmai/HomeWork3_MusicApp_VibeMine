package com.vibemine.musicapp.dto;

import lombok.Data;

@Data
public class DownloadStatusDTO {
    private boolean success;
    private String filePath;  // Local file path
    private String message;
    private double progress;  // 0-100%
}