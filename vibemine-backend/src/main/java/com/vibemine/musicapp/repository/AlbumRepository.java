package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    List<Album> findByArtist_Id(Long artistId);
}