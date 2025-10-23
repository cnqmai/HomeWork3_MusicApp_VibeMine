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
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const isSeeking = useRef(false);
  const appState = useRef(AppState.currentState);
  const userId = 1; // --- Hardcode userId = 1 ---

  // --- Quản lý Queue và Lịch sử Shuffle ---
  const [currentQueue, setCurrentQueue] = useState([]); // Danh sách IDs bài hát đang phát (đã shuffle nếu cần)
  const [originalQueueOrder, setOriginalQueueOrder] = useState([]); // Danh sách Track Objects gốc
  const [playedHistory, setPlayedHistory] = useState([]); // Lịch sử ID bài hát đã phát (cho shuffle previous)
  // Không cần currentQueueIndex nữa, sẽ tìm track theo ID trong originalQueueOrder

  // --- Hàm tải Lyrics ---
  const fetchLyrics = useCallback(async (trackId) => {
    setLyrics([]);
    setCurrentLyricIndex(-1);
    try {
      const { data } = await api.getTrackDetail(trackId);
      if (data && data.lyrics) {
        const parsed = parseLRC(data.lyrics);
        setLyrics(parsed);
      } else {
         console.log(`No lyrics found for track ${trackId}`);
      }
    } catch (error) {
      console.error(`Error fetching lyrics for track ${trackId}:`, error);
    }
  }, []); // Không có dependency

  // --- Hàm xử lý cập nhật trạng thái playback ---
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status) return; // Thoát nếu status là null/undefined

    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback Error: ${status.error}`);
        setIsLoading(false); // Dừng loading nếu lỗi
        setIsPlaying(false);
         Alert.alert('Lỗi phát nhạc', status.error);
         // Không cleanup() ở đây vì có thể gây vòng lặp lỗi
      }
      return; // Khi unload hoặc chưa kịp load xong, không làm gì thêm
    }

    // Cập nhật trạng thái cơ bản
    setDuration(status.durationMillis || 0);
    if (!isSeeking.current) { // Chỉ cập nhật position nếu không đang tua
      setPosition(status.positionMillis || 0);
    }
    // Cập nhật isPlaying dựa trên trạng thái thực tế, trừ khi đang buffering mà chưa play
    setIsPlaying(status.isPlaying);

    // Đồng bộ Lyrics
    if (lyrics.length > 0 && status.positionMillis !== undefined) {
      let newIndex = -1;
      // Tìm index cuối cùng mà thời gian nhỏ hơn hoặc bằng vị trí hiện tại
      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (lyrics[i].time <= status.positionMillis) {
          newIndex = i;
          break;
        }
      }
       // Chỉ cập nhật state nếu index thực sự thay đổi
       // Dùng hàm callback để tránh stale state trong closure
      setCurrentLyricIndex(prevIndex => prevIndex !== newIndex ? newIndex : prevIndex);
    }

    // Xử lý khi bài hát kết thúc
    // isLooping xử lý cho repeat one bởi chính expo-av
    if (status.didJustFinish && !status.isLooping) {
      handleTrackEnd();
    }
  }, [lyrics, isSeeking.current, repeatMode]); // Bỏ handleTrackEnd khỏi dependency

   // --- Dọn dẹp ---
   const cleanup = useCallback(async (resetPlayerState = true) => {
    console.log('Cleaning up audio player...', { resetPlayerState });
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
    // Chỉ reset các state liên quan trực tiếp đến sound
    setIsPlaying(false);
    setDuration(0);
    setPosition(0);
    setLyrics([]);
    setCurrentLyricIndex(-1);

     // Chỉ reset track, queue, history nếu resetPlayerState là true
     if (resetPlayerState) {
        console.log("Resetting player state (track, queue, history).");
        setCurrentTrack(null);
        setCurrentQueue([]);
        setOriginalQueueOrder([]);
        setPlayedHistory([]);
     }
  }, [sound]); // Phụ thuộc vào sound để biết có cần unload không


  // --- Hàm Phát nhạc Nội bộ (không expose ra ngoài) ---
  // Hàm này giờ chỉ phát 1 bài, không quản lý queue
  const playTrackInternal = useCallback(async (track, localUri = null) => {
    if (!track || (!track.trackUrl && !localUri)) {
        Alert.alert('Lỗi', 'Thông tin bài hát không hợp lệ.');
        return false; // Trả về false nếu lỗi
    }

    const source = localUri ? { uri: localUri } : { uri: track.trackUrl };
    const isPlayingOffline = !!localUri;

    console.log(`Internal Play: ${track.id} (${track.title}) from ${isPlayingOffline ? 'local' : 'remote'}`);
    setIsLoading(true);
    // Không reset currentTrack ở đây, cleanup(false) sẽ giữ nó
    setPosition(0);
    setDuration(0);
    setIsPlaying(false); // Bắt đầu ở trạng thái pause/loading
    await cleanup(false); // Dọn sound cũ, giữ track state

    fetchLyrics(track.id); // Tải lời

    try {
      // Log history + tăng play count (Backend xử lý)
      api.playTrack(userId, track.id).catch(err => console.error("Error logging play:", err));

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, staysActiveInBackground: true, playThroughEarpieceAndroid: false,
        playsInSilentModeIOS: true, shouldDuckAndroid: true,
      });

      console.log("Loading sound...");
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        source,
        {
          shouldPlay: true, // Tự động phát
          isLooping: repeatMode === 'one', // Cập nhật isLooping dựa trên repeatMode
          volume: volume,
          progressUpdateIntervalMillis: 300,
        },
        onPlaybackStatusUpdate, // Listener
        !isPlayingOffline // downloadFirst chỉ khi online
      );
      console.log("Sound loaded successfully");

      setSound(newSound);
      setCurrentTrack(track); // Cập nhật track *sau khi* load thành công
       return true; // Trả về true nếu thành công

    } catch (error) {
      console.error('Error in playTrackInternal:', error);
      Alert.alert('Lỗi', `Không thể phát bài hát: ${error.message}`);
      await cleanup(); // Dọn dẹp hoàn toàn nếu lỗi
       return false; // Trả về false nếu lỗi
    } finally {
      setIsLoading(false);
    }
  }, [repeatMode, volume, onPlaybackStatusUpdate, cleanup, fetchLyrics, userId]);


   // --- Hàm bắt đầu phát một danh sách (Queue) ---
   // Hàm này sẽ được gọi từ các màn hình
   const playQueue = useCallback(async (tracksList, startIndex = 0) => {
       if (!tracksList || tracksList.length === 0 || startIndex < 0 || startIndex >= tracksList.length) {
            console.error("Invalid track list or start index for playQueue");
            return;
       }
       const initialTrack = tracksList[startIndex];
       if (!initialTrack) {
            console.error("Initial track not found at index", startIndex);
            return;
       }


       console.log(`Starting queue with ${tracksList.length} tracks, starting with:`, initialTrack.id);

       // Lưu danh sách gốc (chỉ cần track objects)
       const trackObjects = [...tracksList];
       setOriginalQueueOrder(trackObjects);

       let playQueueIds = trackObjects.map(t => t.id); // Lấy danh sách ID

       // Xử lý shuffle ngay từ đầu nếu đang bật
       if (shuffle) {
           playQueueIds = [...playQueueIds]; // Tạo bản sao để shuffle
           // Fisher-Yates shuffle
           for (let i = playQueueIds.length - 1; i > 0; i--) {
               const j = Math.floor(Math.random() * (i + 1));
               [playQueueIds[i], playQueueIds[j]] = [playQueueIds[j], playQueueIds[i]];
           }
           // Đưa bài hát được chọn lên đầu danh sách shuffle ID
           const startingTrackIdIndex = playQueueIds.indexOf(initialTrack.id);
           if (startingTrackIdIndex > 0) {
               [playQueueIds[0], playQueueIds[startingTrackIdIndex]] = [playQueueIds[startingTrackIdIndex], playQueueIds[0]];
           } else if (startingTrackIdIndex === -1) {
                // Nếu không tìm thấy (lỗi?), thêm vào đầu
                playQueueIds.unshift(initialTrack.id);
           }
           setCurrentQueue(playQueueIds); // Lưu danh sách ID đã shuffle
           setPlayedHistory([initialTrack.id]); // Bắt đầu lịch sử shuffle
           console.log("Shuffled queue IDs:", playQueueIds);
       } else {
           setCurrentQueue(playQueueIds); // Queue ID = thứ tự gốc
           setPlayedHistory([]); // Reset lịch sử shuffle
            console.log("Original queue IDs:", playQueueIds);
       }

       // Phát bài hát đầu tiên
       const downloaded = await getDownloadedTracks();
       const localUri = downloaded[initialTrack.id.toString()];
       await playTrackInternal(initialTrack, localUri); // Gọi hàm phát nội bộ

   }, [shuffle, playTrackInternal]); // Phụ thuộc vào shuffle và playTrackInternal


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
              // Nếu đã hết bài và không lặp lại -> tua về đầu trước khi phát
              if (status.didJustFinish && repeatMode !== 'one') {
                   console.log("Replaying finished track from beginning");
                  await sound.setPositionAsync(0);
                  await sound.playAsync();
              } else {
                  // Nếu đang pause hoặc repeat one -> chỉ cần play
                   console.log("Playing track");
                  await sound.playAsync();
              }
          }
      } catch (error) {
          console.error("Error toggling Play/Pause:", error);
      }
  }, [sound, repeatMode]); // Thêm repeatMode


  // --- Hàm tìm và phát bài hát tiếp theo/trước đó trong queue ---
   const playNextTrackInQueue = useCallback(async (direction = 'next') => {
       if (!currentTrack || currentQueue.length === 0) {
            console.log("Cannot play next/prev: No current track or empty queue.");
            // Có thể dừng hẳn player ở đây
            await cleanup();
            return;
       }
       setIsLoading(true); // Báo hiệu đang chuyển bài
       let trackToPlay = null;
       const currentId = currentTrack.id;

       try {
           if (shuffle) {
               if (direction === 'next') {
                   const unplayedInShuffle = currentQueue.filter(id => !playedHistory.includes(id));
                   if (unplayedInShuffle.length > 0) {
                       const randomIndex = Math.floor(Math.random() * unplayedInShuffle.length);
                       const nextId = unplayedInShuffle[randomIndex];
                       trackToPlay = originalQueueOrder.find(t => t.id === nextId);
                       if (trackToPlay) setPlayedHistory(prev => [...prev, trackToPlay.id]);
                       console.log("Shuffle Next (Unplayed):", trackToPlay?.id);
                   } else { // Hết bài chưa phát -> quay vòng nếu repeat all
                        if (repeatMode === 'all') {
                             console.log("Shuffle cycle completed. Restarting (Repeat All).");
                             // Tạo lại queue shuffle mới hoàn toàn
                             const shuffledIds = [...currentQueue];
                              for (let i = shuffledIds.length - 1; i > 0; i--) {
                                   const j = Math.floor(Math.random() * (i + 1));
                                   [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
                              }
                             const nextId = shuffledIds[0]; // Lấy bài đầu tiên trong list mới shuffle
                             trackToPlay = originalQueueOrder.find(t => t.id === nextId);
                             if (trackToPlay) setPlayedHistory([trackToPlay.id]); // Bắt đầu lại history
                             console.log("New Shuffle Cycle Start:", trackToPlay?.id);
                        } else {
                            console.log("Shuffle finished. No Repeat All.");
                             // Dừng phát nhạc
                            await cleanup(); // Reset player
                            return;
                        }
                   }
               } else { // direction === 'prev' (Shuffle)
                    if (playedHistory.length > 1) {
                         const prevId = playedHistory[playedHistory.length - 2]; // Lấy ID trước đó
                         trackToPlay = originalQueueOrder.find(t => t.id === prevId);
                         setPlayedHistory(prev => prev.slice(0, -1)); // Xóa bài hiện tại khỏi history
                         console.log("Shuffle Previous:", trackToPlay?.id);
                    } else {
                         console.log("No previous track in shuffle history. Seeking to 0.");
                         await seekTo(0); // Tua về đầu bài hiện tại
                    }
               }
           } else { // Không Shuffle
               const currentIndexInQueue = currentQueue.indexOf(currentId);
               let nextIndex = -1;

               if (direction === 'next') {
                   if (currentIndexInQueue !== -1 && currentIndexInQueue < currentQueue.length - 1) {
                       nextIndex = currentIndexInQueue + 1;
                       console.log("Queue Next:", currentQueue[nextIndex]);
                   } else if (currentIndexInQueue === currentQueue.length - 1 && repeatMode === 'all') {
                       nextIndex = 0; // Quay về đầu nếu repeat all
                       console.log("Queue Next (Repeat All):", currentQueue[nextIndex]);
                   } else {
                       console.log("Queue finished. No Repeat All.");
                       // Dừng phát nhạc
                       await cleanup(); // Reset player
                       return;
                   }
               } else { // direction === 'prev'
                   if (currentIndexInQueue > 0) {
                       nextIndex = currentIndexInQueue - 1;
                       console.log("Queue Previous:", currentQueue[nextIndex]);
                   } else if (currentIndexInQueue === 0) {
                       // Quay về cuối (tùy chọn, chỉ khi repeat all?)
                       if (repeatMode === 'all') {
                           nextIndex = currentQueue.length - 1;
                            console.log("Queue Previous (Wrap Around):", currentQueue[nextIndex]);
                       } else {
                            console.log("At beginning of queue. Seeking to 0.");
                            await seekTo(0); // Tua về đầu bài hiện tại
                       }
                   } else {
                        // Không tìm thấy index hiện tại? Tua về đầu
                         console.log("Current track not found in queue? Seeking to 0.");
                        await seekTo(0);
                   }
               }

               if (nextIndex !== -1) {
                   const nextId = currentQueue[nextIndex];
                   trackToPlay = originalQueueOrder.find(t => t.id === nextId);
               }
           }

           // Phát bài đã tìm được
           if (trackToPlay) {
               const downloaded = await getDownloadedTracks();
               const localUri = downloaded[trackToPlay.id.toString()];
               await playTrackInternal(trackToPlay, localUri);
           }
           // else: Các trường hợp dừng hoặc seek đã xử lý bên trong

       } catch (error) {
           console.error(`Error playing ${direction} track:`, error);
           Alert.alert("Lỗi", `Không thể chuyển bài ${direction === 'next' ? 'tiếp theo' : 'trước đó'}.`);
       } finally {
            // Chỉ tắt loading nếu playTrackInternal không thành công hoặc không tìm thấy bài
            // playTrackInternal sẽ tự tắt loading khi nó thành công
            if (!trackToPlay) {
                 setIsLoading(false);
            }
       }

   }, [currentTrack, currentQueue, originalQueueOrder, playedHistory, shuffle, repeatMode, playTrackInternal, seekTo, sound, cleanup]); // Thêm cleanup


   // --- Xử lý kết thúc bài hát (Đơn giản hóa) ---
   const handleTrackEnd = useCallback(async () => {
    // isLooping (cho repeat one) đã được xử lý bởi onPlaybackStatusUpdate
    // Chỉ cần gọi playNextTrackInQueue cho repeat all và shuffle
    if (repeatMode === 'all' || shuffle) {
        await playNextTrackInQueue('next');
    } else { // repeatMode === 'none'
        console.log("Track ended. Repeat mode none.");
        setIsPlaying(false);
        setCurrentLyricIndex(-1); // Reset lyric
        if (sound) {
           try {
             await sound.pauseAsync(); // Chỉ cần pause
             await sound.setPositionAsync(0); // và tua về đầu
             setPosition(0);
           } catch(e) { console.error("Error resetting position after end:", e); }
        }
    }
  }, [repeatMode, shuffle, sound, playNextTrackInQueue]); // Phụ thuộc vào playNextTrackInQueue


  // --- Next (Gọi hàm nội bộ) ---
   const skipToNext = useCallback(async () => {
       await playNextTrackInQueue('next');
   }, [playNextTrackInQueue]);

  // --- Previous (Gọi hàm nội bộ hoặc seek) ---
  const skipToPrevious = useCallback(async () => {
     if (isLoading || !currentTrack) return;
     const status = await sound?.getStatusAsync();
     // Tua về đầu nếu > 3 giây hoặc đang shuffle và là bài đầu tiên trong history
     if (status?.isLoaded && (status.positionMillis > 3000 || (shuffle && playedHistory.length <= 1))) {
         console.log("Seeking to beginning of current track (Previous action)");
         await seekTo(0);
         if (!status.isPlaying) await sound?.playAsync();
     } else {
         await playNextTrackInQueue('prev'); // Gọi hàm nội bộ để tìm bài trước
     }
  }, [isLoading, currentTrack, sound, seekTo, playNextTrackInQueue, shuffle, playedHistory.length]); // Thêm shuffle, playedHistory.length


  // --- Seek (Giữ nguyên) ---
  const seekTo = useCallback(async (positionMillis) => {
      if (!sound) return; try { isSeeking.current = true; await sound.setPositionAsync(positionMillis); setPosition(positionMillis); } catch (e) { console.error("Err seeking:", e); } finally { setTimeout(() => { isSeeking.current = false; }, 100); }
  }, [sound]);


  // --- Cycle Repeat Mode ---
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prevMode => {
      let newMode = 'none';
      if (prevMode === 'none') newMode = 'all';
      else if (prevMode === 'all') newMode = 'one';
      
      // Cập nhật isLooping của sound hiện tại
      sound?.setIsLoopingAsync(newMode === 'one').catch(e => console.error("Error setting looping:", e));
      console.log("Repeat mode changed to:", newMode);
      // TODO: Gọi API lưu trạng thái nếu cần
      return newMode;
    });
  }, [sound]);

   // --- Toggle Shuffle ---
   const toggleShuffleCallback = useCallback(() => {
    setShuffle(prevShuffle => {
        const newShuffleState = !prevShuffle;
        console.log("Shuffle toggled to:", newShuffleState);
        
        // Lấy danh sách ID gốc
        const originalIds = originalQueueOrder.map(t => t.id);

        if (newShuffleState) {
            // Bật shuffle: Xáo trộn original IDs
            const shuffledIds = [...originalIds];
             const currentId = currentTrack?.id;
             
             // Fisher-Yates shuffle
             for (let i = shuffledIds.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
             }
             
             // Đưa bài hiện tại lên đầu shuffled list nếu nó có trong list gốc
             if (currentId && originalIds.includes(currentId)) {
                const currentIdIndexInShuffled = shuffledIds.indexOf(currentId);
                if (currentIdIndexInShuffled > 0) {
                    [shuffledIds[0], shuffledIds[currentIdIndexInShuffled]] = [shuffledIds[currentIdIndexInShuffled], shuffledIds[0]];
                }
             } else if (currentId && !originalIds.includes(currentId)) {
                  // Nếu bài hiện tại không có trong queue gốc? Thêm vào đầu shuffle
                  shuffledIds.unshift(currentId);
             }


            setCurrentQueue(shuffledIds);
            setPlayedHistory(currentId ? [currentId] : []); // Bắt đầu lịch sử
            console.log("New shuffled queue IDs:", shuffledIds);
        } else {
            // Tắt shuffle: Quay lại original IDs
            setCurrentQueue(originalIds);
            setPlayedHistory([]); // Reset lịch sử shuffle
            console.log("Reset to original queue IDs:", originalIds);
        }
        
        // TODO: Gọi API lưu trạng thái nếu cần
        return newShuffleState;
    });
   }, [originalQueueOrder, currentTrack]);


  // --- Effect lắng nghe AppState ---
  useEffect(() => {
    // Hàm xử lý khi AppState thay đổi
    const handleAppStateChange = (nextAppState) => {
      // Tạm thời chỉ log trạng thái, không tự động pause/resume
      // Bạn có thể thêm logic pause/resume ở đây nếu muốn
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      } else if (nextAppState.match(/inactive|background/)) {
         console.log('App has gone to the background!');
         // Nếu muốn pause nhạc khi vào background, bỏ // ở dòng dưới
         // if (isPlaying && sound) { sound.pauseAsync(); }
      }
      appState.current = nextAppState;
      // console.log('AppState:', appState.current); // Log trạng thái hiện tại
    };

    // Đăng ký listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    console.log("AppState listener registered."); // Log khi đăng ký

    // Hàm dọn dẹp khi hook unmount: gỡ bỏ listener
    return () => {
      console.log("Removing AppState listener."); // Log khi gỡ bỏ
      subscription.remove();
    };
  }, []); // Mảng dependency rỗng `[]` -> Chỉ chạy 1 lần khi hook mount và cleanup khi unmount

  // --- Effect dọn dẹp chính khi unmount ---
  // Hook này đảm bảo sound được giải phóng khi component dùng hook này bị hủy
  useEffect(() => {
    // Trả về hàm cleanup đã được định nghĩa bằng useCallback
    return () => {
      console.log("MusicPlayer hook unmounting. Cleaning up sound and state...");
      cleanup(true); // Gọi cleanup với resetPlayerState = true
    };
  }, [cleanup]); // Phụ thuộc vào hàm cleanup (để nếu cleanup thay đổi thì effect cập nhật)

  return {
    sound, currentTrack, isPlaying, isLoading, duration, position,
    repeatMode, shuffle, volume, lyrics, currentLyricIndex, userId,
    playQueue, // Expose hàm bắt đầu queue mới
    // playTrack: playTrackInternal, // Chỉ expose playQueue? Hay cả play đơn lẻ? Tạm thời ẩn playTrackInternal
    togglePlayPause, skipToNext, skipToPrevious, seekTo,
    cycleRepeatMode,
    toggleShuffle: toggleShuffleCallback,
    setVolume: (vol) => {
        // Giới hạn giá trị vol từ 0 đến 1
        const clampedVol = Math.max(0, Math.min(1, vol));
        setVolume(clampedVol);
        sound?.setVolumeAsync(clampedVol).catch(e => console.error("Error setting volume:", e)); // Thêm catch
    },
  };
};