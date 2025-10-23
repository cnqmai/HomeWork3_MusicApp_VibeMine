// src/main/java/com/vibemine/musicapp/model/Album.java

package com.vibemine.musicapp.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Album {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;          // Tên Album (FR-6.4)
    private String coverArtUrl;    // Ảnh bìa Album
    private Integer releaseYear;   // Năm phát hành

    // Album thuộc về một nghệ sĩ
    @ManyToOne 
    @JoinColumn(name = "artist_id")
    private Artist artist;

    // Album chứa nhiều bài hát
    @OneToMany(mappedBy = "album")
    private List<Track> tracks;
}