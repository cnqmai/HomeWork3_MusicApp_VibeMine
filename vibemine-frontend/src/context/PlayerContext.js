import React, { createContext, useState } from 'react';
import { Audio } from 'expo-av';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);

    async function playTrack(track) {
        // Nếu có bài hát đang chạy, hãy dừng và giải phóng nó trước
        if (sound) {
            await sound.unloadAsync();
        }

        // Kiểm tra URL bài hát (quan trọng!)
        if (!track.trackUrl || track.trackUrl.startsWith('placeholder')) {
            alert('Lỗi: URL của bài hát không hợp lệ. Vui lòng cập nhật trong data.sql.');
            return;
        }

        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.trackUrl },
                { shouldPlay: true } // Tự động phát khi tải xong
            );
            setSound(newSound);
            setCurrentTrack(track);
            setIsPlaying(true);
        } catch (error) {
            console.error("Lỗi khi phát bài hát:", error);
            alert('Không thể phát bài hát này.');
        }
    }

    async function onPlayPausePress() {
        if (!sound) {
            return;
        }
        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
    }

    const value = {
        currentTrack,
        isPlaying,
        playTrack,
        onPlayPausePress,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};