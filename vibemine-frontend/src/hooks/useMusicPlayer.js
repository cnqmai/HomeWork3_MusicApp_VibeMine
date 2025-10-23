import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Alert, AppState, Platform } from 'react-native'; // Thêm Platform
import api from '../api/api';
import { parseLRC } from '../utils/LyricsParser';

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
    if (!status) return; // Thoát nếu status là null/undefined

    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback Error: ${status.error}`);
        // Không nên cleanup() ở đây vì có thể gây vòng lặp lỗi
        setIsLoading(false); // Dừng loading nếu lỗi
        setIsPlaying(false);
        // Có thể reset track nếu cần
        // setCurrentTrack(null);
         Alert.alert('Lỗi phát nhạc', status.error);
      }
      return;
    }

    setDuration(status.durationMillis || 0);
    if (!isSeeking.current) {
      setPosition(status.positionMillis || 0);
    }
    // Cập nhật isPlaying dựa trên trạng thái thực tế, trừ khi đang buffering mà chưa play
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
  }, [lyrics, isSeeking, repeatMode]); // Bỏ handleTrackEnd khỏi dependency

   // --- Dọn dẹp ---
   const cleanup = useCallback(async (resetCurrentTrack = true) => {
    console.log('Cleaning up audio player...', { resetCurrentTrack });
    if (sound) {
      try {
        await sound.setStatusAsync({ shouldPlay: false }); // Dừng trước khi unload
        await sound.unloadAsync();
        console.log("Sound unloaded successfully.");
      } catch (e) {
          console.error("Error unloading sound:", e);
      } finally {
           setSound(null); // Luôn set về null
      }
    }
    // Reset các state khác
    setIsPlaying(false);
    setDuration(0);
    setPosition(0);
    setLyrics([]);
    setCurrentLyricIndex(-1);
     if (resetCurrentTrack) {
        setCurrentTrack(null);
     }
  }, [sound]); // Chỉ phụ thuộc sound


  // --- Hàm Phát nhạc (Cập nhật) ---
  const playTrack = useCallback(async (track, localUri = null) => {
    if (!track || (!track.trackUrl && !localUri)) {
        Alert.alert('Lỗi', 'Thông tin bài hát không hợp lệ.');
        return;
    }

    const source = localUri ? { uri: localUri } : { uri: track.trackUrl };
    const isPlayingOffline = !!localUri;

    console.log(`Playing track: ${track.id} (${track.title}) from ${isPlayingOffline ? 'local' : 'remote'} (${source.uri})`);
    setIsLoading(true);
    setCurrentTrack(track); // Set track ngay để UI cập nhật trước khi load xong
    setPosition(0); // Reset position
    setDuration(0); // Reset duration
    setIsPlaying(false); // Tạm set là false khi bắt đầu load
    await cleanup(false); // Dọn sound cũ, giữ track hiện tại

    // Tải lời bài hát
    fetchLyrics(track.id);

    try {
      // Tăng play count chỉ khi phát online
      if (!isPlayingOffline) {
        api.playTrack(track.id).catch(err => console.error("Error updating play count:", err));
      }

      // Cấu hình audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false, // Quan trọng: đảm bảo phát ra loa ngoài/tai nghe
         // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, // Thay bằng constant nếu dùng
         playsInSilentModeIOS: true,
         shouldDuckAndroid: true,
         // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, // Thay bằng constant nếu dùng
      });

      // Tạo và tải sound mới
      console.log("Loading sound...");
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        source, // Sử dụng source đã xác định (local hoặc remote)
        {
          shouldPlay: true, // Tự động phát
          isLooping: repeatMode === 'one',
          volume: volume,
          progressUpdateIntervalMillis: 300,
        },
        onPlaybackStatusUpdate, // Listener
        !isPlayingOffline // downloadFirst chỉ cần khi online
      );
      console.log("Sound loaded successfully");

      // Cập nhật state chính xác sau khi load xong
      setSound(newSound);
      // isPlaying, duration, position sẽ được cập nhật bởi onPlaybackStatusUpdate

    } catch (error) {
      console.error('Error in playTrack:', error);
      Alert.alert('Lỗi', `Không thể phát bài hát: ${error.message}`);
      await cleanup(); // Dọn dẹp hoàn toàn nếu lỗi
    } finally {
      setIsLoading(false); // Kết thúc trạng thái loading tổng thể
    }
  }, [repeatMode, volume, onPlaybackStatusUpdate, cleanup, fetchLyrics]); // Thêm cleanup, fetchLyrics


  // --- Play/Pause ---
  const togglePlayPause = useCallback(async () => {
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return; // Không làm gì nếu chưa load xong

      if (status.isPlaying) {
        await sound.pauseAsync();
        console.log("Paused track");
      } else {
        if (status.didJustFinish) {
          console.log("Replaying track from beginning");
          await sound.replayAsync(); // Dùng replay nếu đã kết thúc
        } else {
           console.log("Playing track");
           await sound.playAsync();
        }
      }
      // isPlaying sẽ tự cập nhật qua onPlaybackStatusUpdate
    } catch (error) {
      console.error("Error toggling Play/Pause:", error);
    }
  }, [sound]); // Phụ thuộc vào sound

  // --- Next ---
   const skipToNext = useCallback(async () => {
    if (isLoading || !currentTrack) return;
    console.log("Skipping to next track...");
    setIsLoading(true);
    let nextTrackToPlay = null;
    try {
        // *** Logic Shuffle sẽ cần thêm vào đây nếu bật shuffle ***
        // if (shuffle) { ... tìm bài ngẫu nhiên ... } else { ... tìm bài kế tiếp ... }

      const { data: nextTrack } = await api.nextTrack(currentTrack.id);
      nextTrackToPlay = nextTrack;

    } catch (error) {
      console.error('Error fetching next track:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin bài hát tiếp theo');
    } finally {
        if (nextTrackToPlay) {
             // Kiểm tra xem bài tiếp theo đã được tải chưa
             const downloaded = await getDownloadedTracks();
             const localUri = downloaded[nextTrackToPlay.id.toString()];
             await playTrack(nextTrackToPlay, localUri); // Phát bài tiếp theo (có thể offline)
        } else {
             setIsLoading(false); // Dừng loading nếu không tìm được bài tiếp theo
        }
    }
  }, [isLoading, currentTrack, playTrack /*, shuffle */]); // Thêm playTrack, shuffle

  // --- Previous ---
  const skipToPrevious = useCallback(async () => {
     if (isLoading || !currentTrack) return;

     // Tua về đầu nếu > 3 giây
     const status = await sound?.getStatusAsync();
     if (status?.isLoaded && status.positionMillis > 3000) {
         console.log("Seeking to beginning of current track");
         await seekTo(0);
         // Đảm bảo nhạc phát nếu đang pause
         if (!status.isPlaying) {
             await sound.playAsync();
         }
         return;
     }

     // Chuyển bài trước đó
     console.log("Skipping to previous track...");
     setIsLoading(true);
     let prevTrackToPlay = null;
    try {
       // *** Logic Shuffle sẽ cần thêm vào đây nếu bật shuffle ***

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
  }, [isLoading, currentTrack, sound, seekTo, playTrack /*, shuffle */]); // Thêm sound, seekTo, playTrack, shuffle

  // --- Seek ---
  const seekTo = useCallback(async (positionMillis) => {
    if (!sound) return;
    try {
       isSeeking.current = true;
       console.log(`Seeking to ${positionMillis}`);
       await sound.setPositionAsync(positionMillis);
       setPosition(positionMillis); // Cập nhật state ngay
       // Không cần play lại sau khi seek, trừ khi logic yêu cầu
       // const status = await sound.getStatusAsync();
       // if (status.isLoaded && !status.isPlaying) await sound.playAsync();
    } catch (error) {
      console.error("Error seeking:", error);
    } finally {
        // Đặt timeout nhỏ để đảm bảo onPlaybackStatusUpdate kịp nhận giá trị mới trước khi isSeeking về false
        setTimeout(() => { isSeeking.current = false; }, 100);
    }
  }, [sound]); // Phụ thuộc sound

  // --- Xử lý kết thúc bài hát (Đã sửa ở trên) ---
  const handleTrackEnd = useCallback(async () => {
    console.log("Track ended. Repeat mode:", repeatMode);
    setCurrentLyricIndex(-1);
    if (repeatMode === 'one' && sound) {
      try { await sound.replayAsync(); } catch (e) { console.error("Error replaying:", e); }
    } else if (repeatMode === 'all') {
      await skipToNext(); // skipToNext đã bao gồm playTrack
    } else { // repeatMode === 'none'
      setIsPlaying(false);
      if (sound) {
         try {
           await sound.pauseAsync(); // Chỉ cần pause
           await sound.setPositionAsync(0); // và tua về đầu
           setPosition(0);
         } catch(e) { console.error("Error resetting position after end:", e); }
      }
    }
  }, [repeatMode, sound, skipToNext]); // Chỉ cần skipToNext

   // --- Effect lắng nghe AppState ---
   useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // console.log("AppState changed to", nextAppState); // Debug log
      // Tạm thời không cần xử lý pause/resume tự động vì có staysActiveInBackground
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []); // Không cần dependency

  // --- Effect dọn dẹp khi unmount ---
   useEffect(() => {
    return () => {
      console.log("MusicPlayer hook unmounting. Cleaning up...");
      cleanup();
    };
  }, [cleanup]); // Phụ thuộc cleanup


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
    playTrack,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    setRepeatMode: (mode) => setRepeatMode(mode), // Hàm set đơn giản
    toggleShuffle: () => setShuffle(prev => !prev),
    setVolume: (vol) => { // Cập nhật cả state và volume của sound
        setVolume(vol);
        sound?.setVolumeAsync(vol); // Cập nhật ngay lập tức
    },
  };
};