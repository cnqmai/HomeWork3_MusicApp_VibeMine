import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { useNavigation } from '@react-navigation/native';
import api from '../api/api'; // Cần cho Share

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
  const navigation = useNavigation();
  const {
    currentTrack,
    isPlaying,
    isLoading, // Loading cho việc tải bài hát mới
    duration,
    position,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    lyrics,
    currentLyricIndex,
    // --- Lấy thêm state và hàm từ hook ---
    repeatMode, // 'none', 'one', 'all'
    shuffle,    // boolean
    volume,     // 0-1
    cycleRepeatMode,
    toggleShuffle,
    setVolume,
    // ---
    sound, // Để kiểm tra sound đã load chưa
  } = useMusicPlayer();

  const scrollViewRef = useRef(null);
  const lyricLineRefs = useRef({});
  const isSeekingSlider = useRef(false);

  // --- Effect tự động cuộn Lyrics ---
  useEffect(() => {
    if (currentLyricIndex > -1 && scrollViewRef.current && lyricLineRefs.current[currentLyricIndex]) {
       lyricLineRefs.current[currentLyricIndex].measureLayout(
         scrollViewRef.current.getInnerViewNode(),
        (x, y, w, h) => {
            const scrollViewHeight = styles.lyricsScrollView.height || 100; // Lấy chiều cao thực tế
            const scrollToY = y - scrollViewHeight / 2 + h / 2 - 10; // Điều chỉnh offset
            scrollViewRef.current.scrollTo({ y: Math.max(0, scrollToY), animated: true });
        },
        () => { /* console.error("Could not measure lyric line layout"); */ }
      );
    } else if (currentLyricIndex === -1 && scrollViewRef.current) {
        // Chỉ cuộn về đầu nếu scroll view không ở gần đầu
        // scrollViewRef.current.measure((x, y, w, h, pageX, pageY) => {
        //      if (y > 50) { // Nếu scroll > 50px mới cuộn về 0
                 scrollViewRef.current.scrollTo({ y: 0, animated: true });
        //      }
        // });
    }
  }, [currentLyricIndex]);

   // --- Effect đóng màn hình ---
   useEffect(() => {
    // Đóng khi không loading VÀ không có track VÀ có thể quay lại
    if (!isLoading && !currentTrack && navigation.canGoBack()) {
      console.log("PlayerScreen: No current track, going back.");
      navigation.goBack();
    }
  }, [currentTrack, isLoading, navigation]);

  // --- Hàm Share ---
  const handleShare = async () => {
      if (!currentTrack) return;
      try {
          const { data: shareData } = await api.getShareLink(currentTrack.id);
          if (!shareData || !shareData.shareUrl) throw new Error("No share data");
          const message = Platform.OS === 'android' ? `${shareData.message}\n${shareData.shareUrl}` : shareData.message;
          await Share.share({ message, url: Platform.OS === 'ios' ? shareData.shareUrl : undefined, title: `Chia sẻ: ${currentTrack.title}` });
      } catch (error) {
           if (error.message !== 'User dismissed Share') {
                console.error("Error sharing:", error);
                Alert.alert("Lỗi", "Không thể chia sẻ bài hát.");
           }
      }
  };

  // --- Hàm định dạng thời gian ---
  const formatTime = (milliseconds) => {
     if (isNaN(milliseconds) || milliseconds < 0) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- Xử lý kéo Slider ---
   const handleSlidingStart = () => { isSeekingSlider.current = true; };
   const handleSlidingComplete = (value) => {
        if (sound) {
             seekTo(value);
        }
        // Giảm timeout để isSeeking nhanh chóng về false
        setTimeout(() => { isSeekingSlider.current = false; }, 50);
   };

   // --- Lấy Icon và Màu cho nút Repeat ---
   const getRepeatIcon = () => {
       if (repeatMode === 'one') return { name: 'repeat-one-outline', color: '#9C27B0' };
       if (repeatMode === 'all') return { name: 'repeat-outline', color: '#9C27B0' };
       return { name: 'repeat-outline', color: '#ccc' };
   };

   // --- Lấy Màu cho nút Shuffle ---
   const getShuffleColor = () => {
       return shuffle ? '#9C27B0' : '#ccc';
   };

  // --- Render Loading/No Track ---
  // Hiển thị loading khi đang tải sound ban đầu (isLoading=true và sound=null)
  if (isLoading && !sound) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Đang tải bài hát...</Text>
      </View>
    );
  }
  // Nếu không loading và không có track (ví dụ sau khi cleanup)
  if (!currentTrack) {
     return (
       <View style={[styles.container, styles.center]}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButtonAbsolute}>
            <Ionicons name="close" size={30} color="#fff" />
         </TouchableOpacity>
         <Text style={styles.noTrackText}>Không có bài hát nào.</Text>
       </View>
     );
  }

  // --- Render chính ---
  return (
    <View style={styles.container}>
       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
         <Ionicons name="chevron-down" size={30} color="#ccc" />
       </TouchableOpacity>
       <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
         <Ionicons name="share-outline" size={26} color="#ccc" />
       </TouchableOpacity>
       <View style={styles.headerTitleContainer}>
         <Text style={styles.headerTitleText} numberOfLines={1}>{currentTrack.title}</Text>
       </View>

       {/* Phần nội dung chính có thể cuộn (nếu cần cho màn hình nhỏ) */}
       <ScrollView contentContainerStyle={styles.mainContent}>

           <Image source={{ uri: currentTrack.coverArtUrl }} style={styles.coverArt} />
           <View style={styles.trackInfoContainer}>
             <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
             <Text style={styles.artist} numberOfLines={1}>
               {currentTrack.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
             </Text>
           </View>
           <ScrollView ref={scrollViewRef} style={styles.lyricsScrollView} contentContainerStyle={styles.lyricsContainer} showsVerticalScrollIndicator={false}>
              {lyrics.length > 0 ? (
               lyrics.map((line, index) => (
                 <Text key={`${line.time}-${index}-${line.text.slice(0,5)}`} ref={el => lyricLineRefs.current[index] = el} style={[ styles.lyricLine, index === currentLyricIndex && styles.activeLyricLine, ]} onLayout={() => {}}>{line.text}</Text>
               ))
             ) : (
               <Text style={styles.lyricLine}>{(isLoading && lyrics.length === 0) ? 'Đang tải lời...' : 'Lời bài hát không có sẵn.'}</Text>
             )}
           </ScrollView>

       </ScrollView>

        {/* Phần điều khiển cố định ở dưới */}
        <View style={styles.controlsContainer}>
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
                disabled={!sound || duration <= 0} // Disable khi chưa có sound
             />
             <View style={styles.timeContainer}>
               <Text style={styles.time}>{formatTime(position)}</Text>
               <Text style={styles.time}>{formatTime(duration)}</Text>
             </View>
           </View>

           <View style={styles.controls}>
             {/* Shuffle Button */}
             <TouchableOpacity onPress={toggleShuffle} style={styles.optionButtonSmall}>
               <Ionicons name="shuffle-outline" size={24} color={getShuffleColor()} />
             </TouchableOpacity>
             {/* Previous Button */}
             <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton} disabled={isLoading}>
               <Ionicons name="play-skip-back" size={36} color={isLoading ? "#777" : "#fff"} />
             </TouchableOpacity>
             {/* Play/Pause Button */}
             <TouchableOpacity onPress={togglePlayPause} style={styles.playButton} disabled={!sound}>
               {(isLoading && !isPlaying && sound) ? <ActivityIndicator size="large" color="#fff" /> : <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={70} color="#fff" />}
             </TouchableOpacity>
             {/* Next Button */}
             <TouchableOpacity onPress={skipToNext} style={styles.controlButton} disabled={isLoading}>
               <Ionicons name="play-skip-forward" size={36} color={isLoading ? "#777" : "#fff"} />
             </TouchableOpacity>
              {/* Repeat Button */}
              <TouchableOpacity onPress={cycleRepeatMode} style={styles.optionButtonSmall}>
                <Ionicons name={getRepeatIcon().name} size={24} color={getRepeatIcon().color} />
              </TouchableOpacity>
           </View>

            {/* Volume Control */}
            <View style={styles.volumeControlContainer}>
                <Ionicons name="volume-low-outline" size={20} color="#ccc" style={styles.volumeIcon} />
                <Slider
                    style={styles.volumeSlider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    minimumTrackTintColor="#9C27B0"
                    maximumTrackTintColor="#555"
                    thumbTintColor="#E0E0E0"
                    onValueChange={setVolume}
                />
                <Ionicons name="volume-high-outline" size={20} color="#ccc" style={styles.volumeIcon} />
            </View>
        </View>

       <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    // Bỏ paddingTop, xử lý bằng header và safe area sau
  },
  mainContent: { // Style cho ScrollView nội dung chính
      alignItems: 'center',
      paddingTop: Platform.OS === 'ios' ? 100 : 70, // Padding top để không bị che bởi header/nút
      paddingBottom: 20,
  },
  controlsContainer: { // View chứa các control cố định ở dưới
      width: '100%',
      alignItems: 'center',
      paddingBottom: 10,
      // backgroundColor: '#181818', // Có thể thêm màu nền nhẹ nếu muốn
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
   loadingText: {
        marginTop: 10,
        color: '#ccc',
        fontSize: 16,
   },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 25,
    left: 15,
    zIndex: 10,
    padding: 10,
  },
  closeButtonAbsolute: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 55 : 25,
      left: 15,
      zIndex: 10,
      padding: 10,
  },
  shareButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 55 : 25,
      right: 15,
      zIndex: 10,
      padding: 10,
  },
  headerTitleContainer: {
    position: 'absolute', // Đặt header title cố định ở trên
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 60,
    right: 60, // Để căn giữa
    zIndex: 5,
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
  },
  headerTitleText: {
      fontSize: 16,
      color: '#ccc',
      fontWeight: '600',
      textAlign: 'center',
  },
  coverArt: {
    width: width * 0.7, // Giảm ảnh bìa một chút
    height: width * 0.7,
    borderRadius: 12,
    marginBottom: 15,
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    backgroundColor: '#333',
  },
  trackInfoContainer: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 5, // Giảm margin
    height: 55, // Tăng chiều cao một chút
    justifyContent: 'center',
  },
  title: {
    fontSize: 22, // Tăng font title
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  artist: {
    fontSize: 16, // Tăng font artist
    color: '#bbb',
    textAlign: 'center',
  },
  lyricsScrollView: {
    width: width * 0.9,
    height: 80, // Giảm chiều cao lyrics để vừa màn hình nhỏ
    marginBottom: 5, // Giảm margin
  },
  lyricsContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  lyricLine: {
    fontSize: 15, // Giảm font lyrics
    color: '#666',
    textAlign: 'center',
    marginVertical: 5, // Giảm khoảng cách dòng
    paddingHorizontal: 15,
  },
  activeLyricLine: {
    color: '#eee',
    fontWeight: '600',
    fontSize: 16,
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
      marginBottom: 0, // Bỏ margin
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
    marginTop: -8,
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
    marginTop: 0, // Giảm margin
    marginBottom: 0, // Giảm margin
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
    marginHorizontal: 10,
  },
  disabled: {
    opacity: 0.7,
  },
   optionButtonSmall: {
    padding: 15,
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
   },
   volumeControlContainer: {
       flexDirection: 'row',
       alignItems: 'center',
       width: width * 0.85,
       marginTop: 0, // Bỏ margin
       marginBottom: 5, // Giảm margin
   },
   volumeIcon: {
       marginHorizontal: 8,
   },
   volumeSlider: {
       flex: 1,
       height: 30,
   }
});