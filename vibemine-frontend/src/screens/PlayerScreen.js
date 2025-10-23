import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import useMusicPlayer from '../hooks/useMusicPlayer';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration, 
    onPlaybackStatusUpdate,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSliderChange,
  } = useMusicPlayer();

  const track = currentTrack || route.params?.track;

  React.useEffect(() => {
    if (track) {
      loadTrack(track);
    }
  }, [track]);

  const loadTrack = async (track) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: track.trackUrl },
      { shouldPlay: true }
    );
    // Set sound to player hook
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: track?.coverArtUrl }} style={styles.coverArt} />
      
      <Text style={styles.title}>{track?.title}</Text>
      <Text style={styles.artist}>
        {track?.artists?.map(a => a.name).join(', ')}
      </Text>

      <Slider
        style={styles.progress}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position || 0}
        minimumTrackTintColor="#FF6B6B"
        maximumTrackTintColor="#333"
        thumbTintColor="#FF6B6B"
        onSlidingComplete={handleSliderChange}
      />

      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(position || 0)}</Text>
        <Text style={styles.time}>{formatTime(duration || 0)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePrevious}>
          <Icon name="skip-previous" size={40} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={60} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNext}>
          <Icon name="skip-next" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}