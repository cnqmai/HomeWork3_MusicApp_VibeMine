package com.vibemine.musicapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_favorites") // ✅ Giữ nguyên tên bảng giống data.sql
@IdClass(UserFavoriteId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFavorite {

    @Id
    @Column(name = "user_id") // ✅ Khớp cột trong data.sql
    private Long userId;

    @Id
    @Column(name = "track_id") // ✅ Khớp cột trong data.sql
    private Long trackId;

    @Column(name = "added_at")
    private LocalDateTime addedAt; // có thể null, Hibernate tự cho phép
}
