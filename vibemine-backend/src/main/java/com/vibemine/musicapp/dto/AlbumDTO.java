package com.vibemine.musicapp.dto;

import lombok.Data;

@Data
public class AlbumDTO {
    private Long id;
    private String title;
    private String coverArtUrl;
    private Integer releaseYear;
    private ArtistDTO artist;
}