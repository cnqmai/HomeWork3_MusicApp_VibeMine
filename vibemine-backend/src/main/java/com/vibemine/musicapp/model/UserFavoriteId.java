package com.vibemine.musicapp.model;

import java.io.Serializable;
import java.util.Objects;

public class UserFavoriteId implements Serializable {
    private Long userId;
    private Long trackId;

    // equals, hashCode, constructors...
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserFavoriteId that = (UserFavoriteId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(trackId, that.trackId);
    }

    @Override public int hashCode() {
        return Objects.hash(userId, trackId);
    }
}