import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Share, // --- THÊM MỚI ---
  Alert, // --- THÊM MỚI ---
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { useNavigation } from '@react-navigation/native';
import api from '../api/api'; // --- THÊM MỚI ---

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
  const navigation = useNavigation();
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
    lyrics,
    currentLyricIndex,
    // Sẽ thêm repeat/shuffle sau
    // setRepeatMode,
    // toggleShuffle,
    // setVolume,
  } = useMusicPlayer();

  const scrollViewRef = useRef(null);
  const lyricLineRefs = useRef({});
  const isSeekingSlider = useRef(false);

  // --- Effect tự động cuộn Lyrics (Giữ nguyên) ---
  useEffect(() => {
    if (currentLyricIndex > -1 && scrollViewRef.current && lyricLineRefs.current[currentLyricIndex]) {
       lyricLineRefs.current[currentLyricIndex].measureLayout(
         scrollViewRef.current.getInnerViewNode(),
        (x, y, w, h) => {
            const scrollViewHeight = styles.lyricsScrollView.height || 120;
            const scrollToY = y - scrollViewHeight / 2 + h / 2 - 20;
            scrollViewRef.current.scrollTo({ y: Math.max(0, scrollToY), animated: true });
        },
        () => {
             console.error("Could not measure lyric line layout for index:", currentLyricIndex);
        }
      );
    } else if (currentLyricIndex === -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [currentLyricIndex]);

   // --- Effect đóng màn hình (Giữ nguyên) ---
   useEffect(() => {
    if (!isLoading && !currentTrack) {
      if (navigation.canGoBack()) {
          navigation.goBack();
      }
    }
  }, [currentTrack, isLoading, navigation]);

  // --- Hàm Share (THÊM MỚI - FR-9.1) ---
  const handleShare = async () => {
      if (!currentTrack) return;
      try {
          console.log(`Sharing track: ${currentTrack.id}`); // Debug log
          // 1. Gọi API để lấy link và thông tin
          const { data: shareData } = await api.getShareLink(currentTrack.id);
          
          if (!shareData || !shareData.shareUrl) {
              throw new Error("Không nhận được dữ liệu chia sẻ từ server.");
          }

          // 2. Sử dụng React Native Share API
          const messageToShare = Platform.OS === 'android' ? 
                                  `${shareData.message}\n${shareData.shareUrl}` : // Android gộp link vào message
                                  shareData.message; // iOS dùng message và url riêng

          const result = await Share.share({
              message: messageToShare,
              url: Platform.OS === 'ios' ? shareData.shareUrl : undefined, // URL chỉ cho iOS
              title: `Chia sẻ bài hát: ${currentTrack.title}`
          });

          if (result.action === Share.sharedAction) {
            console.log('Share was successful');
          } else if (result.action === Share.dismissedAction) {
            console.log('Share was dismissed');
          }
      } catch (error) {
           if (error.message !== 'User dismissed Share') {
                console.error("Error sharing:", error);
                Alert.alert("Lỗi", "Không thể chia sẻ bài hát này.");
           }
      }
  };
  // --- KẾT THÚC THÊM MỚI ---

  // --- Hàm định dạng thời gian (Giữ nguyên) ---
  const formatTime = (milliseconds) => {
     if (isNaN(milliseconds) || milliseconds < 0) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- Xử lý kéo Slider (Giữ nguyên) ---
   const handleSlidingStart = () => { isSeekingSlider.current = true; };
   const handleSlidingComplete = (value) => {
        if (sound) { // Kiểm tra sound tồn tại
            seekTo(value);
        }
        isSeekingSlider.current = false;
   };

  // --- Render Loading/No Track (Giữ nguyên) ---
  if (isLoading && !currentTrack) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }
  if (!currentTrack) {
     return (
       <View style={[styles.container, styles.center]}>
         {/* Thêm nút đóng ở đây để thoát nếu bị kẹt */}
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="#fff" />
         </TouchableOpacity>
         <Text style={styles.noTrackText}>Không có bài hát nào đang phát.</Text>
       </View>
     );
  }

  // --- Render chính ---
  return (
    <View style={styles.container}>
       {/* Nút đóng */}
       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
         <Ionicons name="chevron-down" size={30} color="#ccc" />
       </TouchableOpacity>

        {/* --- Nút Share (THÊM MỚI) --- */}
       <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
         <Ionicons name="share-outline" size={26} color="#ccc" />
       </TouchableOpacity>
       {/* --- KẾT THÚC THÊM MỚI --- */}

       {/* Header phụ (tên bài hát) */}
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText} numberOfLines={1}>{currentTrack.title}</Text>
        </View>

      {/* Cover Art */}
      <Image source={{ uri: currentTrack.coverArtUrl }} style={styles.coverArt} />

      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
        </Text>
      </View>

      {/* Lyrics View */}
       <ScrollView
         ref={scrollViewRef}
         style={styles.lyricsScrollView}
         contentContainerStyle={styles.lyricsContainer}
         showsVerticalScrollIndicator={false}
       >
         {lyrics.length > 0 ? (
           lyrics.map((line, index) => (
             <Text
               key={`${line.time}-${index}`}
               ref={el => lyricLineRefs.current[index] = el}
               style={[
                 styles.lyricLine,
                 index === currentLyricIndex && styles.activeLyricLine,
               ]}
               onLayout={() => {}}
             >
               {line.text}
             </Text>
           ))
         ) : (
           <Text style={styles.lyricLine}>{(isLoading && lyrics.length === 0) ? 'Đang tải lời...' : 'Lời bài hát không có sẵn.'}</Text>
         )}
       </ScrollView>

      {/* Progress Bar & Time */}
        <View style={styles.progressContainer}>
            <Slider
                style={styles.progressBar}
                minimumValue={0}
                maximumValue={duration > 0 ? duration : 1}
                value={position}
                minimumTrackTintColor="#9C27B0"
                maximumTrackTintColor="#555"
                thumbTintColor="#E0E0E0"
                onSlidingStart={handleSlidingStart}
                onSlidingComplete={handleSlidingComplete}
                disabled={isLoading || duration <= 0}
            />
            <View style={styles.timeContainer}>
                <Text style={styles.time}>{formatTime(position)}</Text>
                <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>
        </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.optionButtonSmall}>
          <Ionicons name="shuffle-outline" size={24} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={togglePlayPause}
          style={styles.playButton}
          disabled={isLoading && !isPlaying}
        >
          {(isLoading && !isPlaying) ? ( // Hiển thị loading chỉ khi đang load bài mới (chưa play)
             <ActivityIndicator size="large" color="#fff" />
          ): (
             <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={70}
              color="#fff"
             />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={36} color="#fff" />
        </TouchableOpacity>
         <TouchableOpacity style={styles.optionButtonSmall}>
           <Ionicons name="repeat-outline" size={24} color="#ccc" />
         </TouchableOpacity>
      </View>
      <View style={{ height: 30 }} />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 20,
    left: 15,
    zIndex: 10,
    padding: 10,
  },
  shareButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 55 : 20,
      right: 15,
      zIndex: 10,
      padding: 10,
  },
  headerTitleContainer: {
    width: width * 0.7,
    alignItems: 'center',
     marginTop: Platform.OS === 'ios' ? 15 : 5, // Tăng margin top
    marginBottom: 15,
  },
  headerTitleText: {
      fontSize: 16,
      color: '#ccc',
      fontWeight: '600',
      textAlign: 'center',
  },
  coverArt: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 12,
    marginBottom: 20,
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    backgroundColor: '#333', // Thêm màu nền placeholder
  },
  trackInfoContainer: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  artist: {
    fontSize: 15,
    color: '#bbb',
    textAlign: 'center',
  },
  lyricsScrollView: {
    width: width * 0.9,
    height: 120,
    marginBottom: 10,
  },
  lyricsContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 50,
  },
  lyricLine: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  activeLyricLine: {
    color: '#eee',
    fontWeight: '600',
    fontSize: 18,
  },
   noTrackText: {
      color: '#ccc',
      fontSize: 18,
      textAlign: 'center',
      paddingHorizontal: 20,
  },
   progressContainer: {
      width: width * 0.9,
      alignItems: 'center',
      marginBottom: 10,
   },
  progressBar: {
    width: '100%',
    height: 30,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: -5,
  },
  time: {
    color: '#999',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: width * 0.95,
    marginTop: 10,
    marginBottom: 10,
  },
  controlButton: {
    padding: 15,
  },
  playButton: {
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  disabled: {
    opacity: 0.7,
  },
   optionButtonSmall: {
    padding: 15,
   },
});