// src/main/java/com/vibemine/musicapp/repository/ListeningHistoryRepository.java

package com.vibemine.musicapp.repository;

import com.vibemine.musicapp.model.ListeningHistory;
import com.vibemine.musicapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long> {

    // Lấy lịch sử nghe mới nhất của User (FR-8.3)
    List<ListeningHistory> findByUserOrderByListenedAtDesc(User user, Pageable pageable);
}