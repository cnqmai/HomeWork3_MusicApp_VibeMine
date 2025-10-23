package com.vibemine.musicapp.dto;

import lombok.Data;

@Data
public class ShareLinkDTO {
    private String shareUrl;
    private String trackTitle;
    private String artistName;
    private String message;
}