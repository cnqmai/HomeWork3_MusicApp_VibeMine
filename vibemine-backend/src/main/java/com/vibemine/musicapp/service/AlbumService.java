package com.vibemine.musicapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vibemine.musicapp.model.Album;
import com.vibemine.musicapp.repository.AlbumRepository;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;

    public AlbumService(AlbumRepository albumRepository) {
        this.albumRepository = albumRepository;
    }

    public List<Album> getAllAlbums() {
        return albumRepository.findAll();
    }
}