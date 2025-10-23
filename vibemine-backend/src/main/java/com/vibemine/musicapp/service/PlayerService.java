package com.vibemine.musicapp.service;

import com.vibemine.musicapp.dto.PlayerStateDTO;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Data
public class PlayerService {
    private final Map<String, PlayerStateDTO> playerStates = new ConcurrentHashMap<>();

    public PlayerStateDTO getPlayerState(String sessionId) {
        return playerStates.getOrDefault(sessionId, new PlayerStateDTO());
    }

    public PlayerStateDTO setRepeatMode(String sessionId, String repeatMode) {
        PlayerStateDTO state = getPlayerState(sessionId);
        state.setRepeatMode(repeatMode);
        playerStates.put(sessionId, state);
        return state;
    }

    public PlayerStateDTO toggleShuffle(String sessionId) {
        PlayerStateDTO state = getPlayerState(sessionId);
        state.setShuffle(!state.isShuffle());
        playerStates.put(sessionId, state);
        return state;
    }

    public PlayerStateDTO setVolume(String sessionId, double volume) {
        PlayerStateDTO state = getPlayerState(sessionId);
        state.setVolume(Math.max(0, Math.min(1, volume)));
        playerStates.put(sessionId, state);
        return state;
    }

    public String createSession() {
        return UUID.randomUUID().toString();
    }
}