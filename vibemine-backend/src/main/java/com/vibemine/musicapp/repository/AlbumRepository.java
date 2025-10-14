// src/main/java/com/vibemine/musicapp/repository/AlbumRepository.java

package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {

    List<Album> findByTitleContainingIgnoreCase(String title);
}