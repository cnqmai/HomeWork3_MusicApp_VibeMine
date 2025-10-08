// src/main/java/com/vibemine/musicapp/model/Artist.java

package com.vibemine.musicapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Artist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;           // Tên nghệ sĩ (FR-1.2, FR-1.3, FR-6.4)
    private String bio;            // Tiểu sử ngắn
    private String avatarUrl;      // Ảnh đại diện

    @OneToMany(mappedBy = "artist")
    private List<Track> tracks;
    
    @OneToMany(mappedBy = "artist")
    private List<Album> albums; 
}