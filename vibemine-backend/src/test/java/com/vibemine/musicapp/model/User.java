// src/main/java/com/vibemine/musicapp/model/User.java

package com.vibemine.musicapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "app_user") // Đổi tên bảng để tránh xung đột với từ khóa 'USER' của PostgreSQL
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;       // Lưu trữ dưới dạng đã hash
    private String role = "USER";  // Dùng cho Spring Security

    // Danh sách các Playlist do User tạo (FR-3.2)
    @OneToMany(mappedBy = "user")
    private List<Playlist> playlists; 

    // Danh sách các bài hát Yêu thích (FR-3.1, FR-3.4)
    @ManyToMany
    @JoinTable(
        name = "user_favorites",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "track_id")
    )
    private Set<Track> favoriteTracks;
}