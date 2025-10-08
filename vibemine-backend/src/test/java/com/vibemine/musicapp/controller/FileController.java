// src/main/java/com/vibemine/musicapp/controller/FileController.java

package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.service.TrackService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Paths;
import java.util.Optional;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final TrackService trackService;

    // Lấy đường dẫn thư mục lưu trữ file từ application.properties
    @Value("${file.upload-dir}")
    private String uploadDir;

    public FileController(TrackService trackService) {
        this.trackService = trackService;
    }

    /**
     * Endpoint để phát nhạc (Streaming) hoặc tải về (FR-2.5, FR-6.2).
     * Dùng cho cả trackUrl và lyrics.
     * @param trackId ID của bài hát
     */
    @GetMapping("/track/{trackId}")
    public ResponseEntity<Resource> streamTrack(@PathVariable Long trackId) {
        // 1. Lấy đường dẫn file từ DB
        Optional<String> trackUrl = trackService.getTrackById(trackId)
            .map(t -> t.getTrackUrl());

        if (trackUrl.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // 2. Tạo đối tượng File và Resource
        File file = Paths.get(uploadDir, trackUrl.get()).toFile();
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(file);

        // 3. Xây dựng phản hồi (Response)
        HttpHeaders headers = new HttpHeaders();
        
        // Cấu hình cho phép Streaming (FR-2.5)
        headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
        
        // Tên file hiển thị khi tải xuống
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"");

        // Media Type (cần được xác định chính xác hơn trong thực tế, ví dụ: audio/mpeg)
        // Hiện tại giả định là audio/mpeg
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .contentType(MediaType.parseMediaType("audio/mpeg")) 
                .body(resource);
    }
    
    // TODO: Cần có endpoint riêng để lấy ảnh bìa (coverArt) và lời bài hát (Lyrics)
}