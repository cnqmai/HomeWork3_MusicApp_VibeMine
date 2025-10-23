import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../hooks/useMusicPlayer';

export default function MiniPlayer({ navigation }) {
  const { currentTrack, isPlaying, togglePlayPause } = useMusicPlayer();

  if (!currentTrack) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.infoSection}
        onPress={() => navigation.navigate('Player')}
        activeOpacity={0.8}
      >
        <Image source={{ uri: currentTrack.coverArtUrl }} style={styles.coverArt} />
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack?.title || 'Unknown Title'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack?.artists?.[0]?.name || 'Unknown Artist'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    padding: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coverArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  artist: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  playButton: {
    padding: 8,
  },
});
