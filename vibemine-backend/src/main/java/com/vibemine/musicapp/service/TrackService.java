package com.vibemine.musicapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.vibemine.musicapp.model.Album;
import com.vibemine.musicapp.model.Artist;
import com.vibemine.musicapp.model.Track;
import com.vibemine.musicapp.repository.AlbumRepository;
import com.vibemine.musicapp.repository.ArtistRepository;
import com.vibemine.musicapp.repository.TrackRepository;

@Service
public class TrackService {

    private final TrackRepository trackRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;

    public TrackService(TrackRepository trackRepository, ArtistRepository artistRepository, AlbumRepository albumRepository) {
        this.trackRepository = trackRepository;
        this.artistRepository = artistRepository;
        this.albumRepository = albumRepository;
    }

    public List<Track> getAllTracks() {
        return trackRepository.findAll();
    }

    public Optional<Track> getTrackById(Long id) {
        Optional<Track> track = trackRepository.findById(id);
        track.ifPresent(t -> {
            t.setPlayCount(t.getPlayCount() + 1);
            trackRepository.save(t);
        });
        return track;
    }
    
    public List<Track> searchTracks(String keyword) {
        // SỬA LỖI: Đổi tên phương thức để khớp với Repository
        return trackRepository.findByTitleContainingIgnoreCaseOrArtists_NameContainingIgnoreCase(keyword, keyword);
    }
    
    public List<Track> getTrendingTracks() {
        Pageable topTen = PageRequest.of(0, 10); 
        return trackRepository.findAllByOrderByPlayCountDesc(topTen);
    }

    public List<Track> getTracksByGenre(String genre) {
        return trackRepository.findByGenreIgnoreCase(genre);
    }

    public Optional<Album> getAlbumWithTracks(Long albumId) {
        return albumRepository.findById(albumId);
    }

    public Optional<Artist> getArtistWithTracks(Long artistId) {
        return artistRepository.findById(artistId);
    }
}