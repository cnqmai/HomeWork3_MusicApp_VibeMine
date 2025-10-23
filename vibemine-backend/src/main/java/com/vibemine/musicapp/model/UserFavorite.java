package com.vibemine.musicapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;  // ✅ THÊM IMPORT NÀY

@Entity
@Table(name = "user_favorite")
@IdClass(UserFavoriteId.class)
@Data @NoArgsConstructor @AllArgsConstructor
public class UserFavorite {
    @Id private Long userId;
    @Id private Long trackId;
    private LocalDateTime addedAt;
}