package com.vibemine.musicapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vibemine.musicapp.model.Artist;
import com.vibemine.musicapp.repository.ArtistRepository;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;

    public ArtistService(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }
}