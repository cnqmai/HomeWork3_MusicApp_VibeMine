package com.vibemine.musicapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class TrackResponseDTO {
    private Long id;
    private String title;
    private List<ArtistDTO> artists;
    private String coverArtUrl;
    private String trackUrl;
    private Long duration;
    private Long playCount;
    private Long favoriteCount;
    private boolean trending;  // ✅ SỬA: trending thay vì isTrending
}