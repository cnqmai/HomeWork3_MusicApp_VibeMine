import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Slider } from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../hooks/useMusicPlayer';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    duration,
    position,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    setRepeatMode,
    toggleShuffle,
    setVolume,
  } = useMusicPlayer();

  if (!currentTrack) return null;

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Cover Art */}
      <Image source={{ uri: currentTrack.coverArtUrl }} style={styles.coverArt} />

      {/* Track Info */}
      <Text style={styles.title}>{currentTrack.title}</Text>
      <Text style={styles.artist}>
        {currentTrack.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
      </Text>

      {/* FR-2.3: Progress Bar */}
      <Slider
        style={styles.progressBar}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        minimumTrackTintColor="#9C27B0"
        maximumTrackTintColor="#ddd"
        thumbTintColor="#9C27B0"
        onSlidingComplete={seekTo}
        disabled={isLoading}
      />

      {/* FR-2.4: Thời gian */}
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      {/* FR-2.1, FR-2.2: Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={togglePlayPause} 
          style={[styles.playButton, isLoading && styles.disabled]}
          disabled={isLoading}
        >
          <Ionicons 
            name={isLoading ? "hourglass" : isPlaying ? "pause" : "play"} 
            size={48} 
            color="#fff" 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* FR-7: Player Options */}
      <View style={styles.options}>
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="repeat-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={toggleShuffle}>
          <Ionicons name="shuffle-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Ionicons name="volume-high-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    paddingTop: 60,
  },
  coverArt: {
    width: 300,
    height: 300,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  artist: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 32,
  },
  progressBar: {
    width: width * 0.85,
    height: 40,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.85,
    marginBottom: 40,
  },
  time: {
    color: '#fff',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  controlButton: {
    padding: 16,
  },
  playButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 40,
    marginHorizontal: 24,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.8,
  },
  optionButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});