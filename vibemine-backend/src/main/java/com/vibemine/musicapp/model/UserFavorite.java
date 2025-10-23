package com.vibemine.musicapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime; // Đảm bảo import này tồn tại

@Entity
@Table(name = "user_favorite")
@IdClass(UserFavoriteId.class)
@Data @NoArgsConstructor @AllArgsConstructor
public class UserFavorite {
    @Id private Long userId;
    @Id private Long trackId;

    @Column(name = "added_at") // <-- THÊM DÒNG NÀY
    private LocalDateTime addedAt;
}