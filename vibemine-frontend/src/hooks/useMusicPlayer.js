import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import api from '../api/api';

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
  const playbackPosition = useRef(0);

  const playTrack = useCallback(async (track) => {
    setIsLoading(true);
    try {
      // FR-2.1: Tăng play count
      await api.playTrack(track.id);
      
      // FR-2.5: Background play
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.trackUrl },
        { 
          shouldPlay: true,
          isLooping: repeatMode === 'one',
          volume: volume,
        },
        undefined,
        true // Download first
      );
      
      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);
      setDuration(0);
      setPosition(0);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
          setPosition(status.positionMillis || 0);
          playbackPosition.current = status.positionMillis || 0;
          
          if (status.didJustFinish) {
            handleTrackEnd();
          }
        }
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phát bài hát: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [sound, repeatMode, volume]);

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipToNext = async () => {
    if (currentTrack) {
      try {
        const { data: nextTrack } = await api.nextTrack(currentTrack.id);
        await playTrack(nextTrack);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể phát bài tiếp theo');
      }
    }
  };

  const skipToPrevious = async () => {
    if (currentTrack) {
      try {
        const { data: prevTrack } = await api.prevTrack(currentTrack.id);
        await playTrack(prevTrack);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể phát bài trước');
      }
    }
  };

  const seekTo = async (positionMillis) => {
    if (sound) {
      await sound.setPositionAsync(positionMillis);
    }
  };

  const handleTrackEnd = async () => {
    if (repeatMode === 'one') {
      await sound.replayAsync();
    } else if (repeatMode === 'all') {
      await skipToNext();
    } else {
      setIsPlaying(false);
    }
  };

  const cleanup = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return {
    currentTrack,
    isPlaying,
    isLoading,
    duration,
    position,
    repeatMode,
    shuffle,
    volume,
    playTrack,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    setRepeatMode,
    toggleShuffle: () => setShuffle(!shuffle),
    setVolume,
    cleanup,
  };
};