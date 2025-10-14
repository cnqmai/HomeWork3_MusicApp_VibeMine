// src/main/java/com/vibemine/musicapp/repository/ArtistRepository.java

package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {

    Optional<Artist> findByNameIgnoreCase(String name);
}