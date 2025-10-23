import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Alert, AppState, Platform } from 'react-native';
import api from '../api/api';
import { parseLRC } from '../utils/LyricsParser';
import { getDownloadedTracks } from '../utils/DownloadManager'; // Import thêm

export const useMusicPlayer = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [repeatMode, setRepeatMode] = useState('none');
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const isSeeking = useRef(false);
  const appState = useRef(AppState.currentState);
  const userId = 1; // --- Hardcode userId = 1 ---

  // --- Hàm tải Lyrics ---
  const fetchLyrics = useCallback(async (trackId) => {
    setLyrics([]);
    setCurrentLyricIndex(-1);
    try {
      const { data } = await api.getTrackDetail(trackId);
      if (data && data.lyrics) {
        const parsed = parseLRC(data.lyrics);
        setLyrics(parsed);
      }
    } catch (error) {
      console.error('Error fetching lyrics:', error);
    }
  }, []); // Không có dependency

  // --- Hàm xử lý cập nhật trạng thái playback ---
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status) return; 

    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback Error: ${status.error}`);
        setIsLoading(false);
        setIsPlaying(false);
         Alert.alert('Lỗi phát nhạc', status.error);
      }
      return;
    }

    setDuration(status.durationMillis || 0);
    if (!isSeeking.current) {
      setPosition(status.positionMillis || 0);
    }
    setIsPlaying(status.isPlaying);

    // Đồng bộ Lyrics
    if (lyrics.length > 0 && status.positionMillis !== undefined) {
      let newIndex = -1;
      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (lyrics[i].time <= status.positionMillis) {
          newIndex = i;
          break;
        }
      }
      setCurrentLyricIndex(prevIndex => prevIndex !== newIndex ? newIndex : prevIndex);
    }

    // Xử lý khi bài hát kết thúc
    if (status.didJustFinish && !status.isLooping) {
      handleTrackEnd();
    }
  }, [lyrics, isSeeking, repeatMode]); // Bỏ handleTrackEnd

   // --- Dọn dẹp ---
   const cleanup = useCallback(async (resetCurrentTrack = true) => {
    console.log('Cleaning up audio player...', { resetCurrentTrack });
    if (sound) {
      try {
        await sound.setStatusAsync({ shouldPlay: false });
        await sound.unloadAsync();
        console.log("Sound unloaded successfully.");
      } catch (e) {
          console.error("Error unloading sound:", e);
      } finally {
           setSound(null);
      }
    }
    setIsPlaying(false);
    setDuration(0);
    setPosition(0);
    setLyrics([]);
    setCurrentLyricIndex(-1);
     if (resetCurrentTrack) {
        setCurrentTrack(null);
     }
  }, [sound]);


  // --- Hàm Phát nhạc (Cập nhật) ---
  const playTrack = useCallback(async (track, localUri = null) => {
    if (!track || (!track.trackUrl && !localUri)) {
        Alert.alert('Lỗi', 'Thông tin bài hát không hợp lệ.');
        return;
    }
    // Nếu bài hát đang phát chính là bài được nhấn
    if (sound && currentTrack && currentTrack.id === track.id) {
        togglePlayPause(); // Thì chỉ Play/Pause
        return;
    }

    const source = localUri ? { uri: localUri } : { uri: track.trackUrl };
    const isPlayingOffline = !!localUri;

    console.log(`Playing track: ${track.id} (${track.title}) from ${isPlayingOffline ? 'local' : 'remote'} (${source.uri})`);
    setIsLoading(true);
    setCurrentTrack(track);
    setPosition(0);
    setDuration(0);
    setIsPlaying(false);
    await cleanup(false);

    fetchLyrics(track.id);

    try {
      // --- CẬP NHẬT (FR-8.3) ---
      // Gọi API playTrack với userId và trackId
      api.playTrack(userId, track.id).catch(err => console.error("Error updating play count/history:", err));
      // --- KẾT THÚC CẬP NHẬT ---

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      console.log("Loading sound...");
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        source,
        {
          shouldPlay: true,
          isLooping: repeatMode === 'one',
          volume: volume,
          progressUpdateIntervalMillis: 300,
        },
        onPlaybackStatusUpdate,
        !isPlayingOffline
      );
      console.log("Sound loaded successfully");

      setSound(newSound);

    } catch (error) {
      console.error('Error in playTrack:', error);
      Alert.alert('Lỗi', `Không thể phát bài hát: ${error.message}`);
      await cleanup();
    } finally {
      setIsLoading(false);
    }
  }, [repeatMode, volume, onPlaybackStatusUpdate, cleanup, fetchLyrics, userId, sound, currentTrack]); // Thêm dependencies

  // --- Play/Pause ---
  const togglePlayPause = useCallback(async () => {
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await sound.pauseAsync();
        console.log("Paused track");
      } else {
        if (status.didJustFinish) {
          console.log("Replaying track from beginning");
          await sound.replayAsync();
        } else {
           console.log("Playing track");
           await sound.playAsync();
        }
      }
    } catch (error) {
      console.error("Error toggling Play/Pause:", error);
    }
  }, [sound]);

   // --- Xử lý kết thúc bài hát (Cần khai báo trước skipToNext) ---
   const handleTrackEnd = useCallback(async () => {
    console.log("Track ended. Repeat mode:", repeatMode);
    setCurrentLyricIndex(-1);
    
    // Logic skipToNext (để tránh lỗi "Cannot access 'skipToNext' before initialization")
    const skipNext = async () => {
        if (isLoading || !currentTrack) return;
        console.log("Skipping to next track (after end)...");
        setIsLoading(true);
        let nextTrackToPlay = null;
        try {
            // *** Cần logic shuffle ở đây ***
            const { data: nextTrack } = await api.nextTrack(currentTrack.id);
            nextTrackToPlay = nextTrack;
        } catch (error) {
            console.error('Error fetching next track (after end):', error);
        } finally {
            if (nextTrackToPlay) {
                const downloaded = await getDownloadedTracks();
                const localUri = downloaded[nextTrackToPlay.id.toString()];
                await playTrack(nextTrackToPlay, localUri);
            } else {
                setIsLoading(false);
            }
        }
    };

    if (repeatMode === 'one' && sound) {
      try { await sound.replayAsync(); } catch (e) { console.error("Error replaying:", e); }
    } else if (repeatMode === 'all') {
      await skipNext(); // Gọi hàm nội bộ
    } else { // repeatMode === 'none'
      setIsPlaying(false);
      if (sound) {
         try {
           await sound.pauseAsync();
           await sound.setPositionAsync(0);
           setPosition(0);
         } catch(e) { console.error("Error resetting position after end:", e); }
      }
    }
  }, [repeatMode, sound, isLoading, currentTrack, playTrack]); // Thêm playTrack


  // --- Next ---
   const skipToNext = useCallback(async () => {
    if (isLoading || !currentTrack) return;
    console.log("Skipping to next track (manual)...");
    setIsLoading(true);
    let nextTrackToPlay = null;
    try {
      // *** Cần logic shuffle ở đây ***
      const { data: nextTrack } = await api.nextTrack(currentTrack.id);
      nextTrackToPlay = nextTrack;
    } catch (error) {
      console.error('Error fetching next track:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin bài hát tiếp theo');
    } finally {
        if (nextTrackToPlay) {
             const downloaded = await getDownloadedTracks();
             const localUri = downloaded[nextTrackToPlay.id.toString()];
             await playTrack(nextTrackToPlay, localUri);
        } else {
             setIsLoading(false);
        }
    }
  }, [isLoading, currentTrack, playTrack /*, shuffle */]);

  // --- Previous ---
  const skipToPrevious = useCallback(async () => {
     if (isLoading || !currentTrack) return;

     const status = await sound?.getStatusAsync();
     if (status?.isLoaded && status.positionMillis > 3000) {
         console.log("Seeking to beginning of current track");
         await seekTo(0);
         if (!status.isPlaying) {
             await sound.playAsync();
         }
         return;
     }

     console.log("Skipping to previous track...");
     setIsLoading(true);
     let prevTrackToPlay = null;
    try {
      // *** Cần logic shuffle ở đây ***
      const { data: prevTrack } = await api.prevTrack(currentTrack.id);
      prevTrackToPlay = prevTrack;
    } catch (error) {
      console.error('Error fetching previous track:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin bài hát trước đó');
    } finally {
       if (prevTrackToPlay) {
            const downloaded = await getDownloadedTracks();
            const localUri = downloaded[prevTrackToPlay.id.toString()];
            await playTrack(prevTrackToPlay, localUri);
       } else {
            setIsLoading(false);
       }
    }
  }, [isLoading, currentTrack, sound, seekTo, playTrack /*, shuffle */]);

  // --- Seek ---
  const seekTo = useCallback(async (positionMillis) => {
    if (!sound) return;
    try {
       isSeeking.current = true;
       console.log(`Seeking to ${positionMillis}`);
       await sound.setPositionAsync(positionMillis);
       setPosition(positionMillis);
    } catch (error) {
      console.error("Error seeking:", error);
    } finally {
        setTimeout(() => { isSeeking.current = false; }, 100);
    }
  }, [sound]);

   // --- Effect lắng nghe AppState ---
   useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // --- Effect dọn dẹp khi unmount ---
   useEffect(() => {
    return () => {
      console.log("MusicPlayer hook unmounting. Cleaning up...");
      cleanup();
    };
  }, [cleanup]);


  return {
    sound,
    currentTrack,
    isPlaying,
    isLoading,
    duration,
    position,
    repeatMode,
    shuffle,
    volume,
    lyrics,
    currentLyricIndex,
    userId, // Trả về userId
    playTrack,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    setRepeatMode: (mode) => setRepeatMode(mode),
    toggleShuffle: () => setShuffle(prev => !prev),
    setVolume: (vol) => {
        setVolume(vol);
        sound?.setVolumeAsync(vol);
    },
  };
};