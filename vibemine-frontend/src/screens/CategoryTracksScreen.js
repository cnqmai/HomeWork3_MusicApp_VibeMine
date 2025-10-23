// src/screens/CategoryTracksScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity, // Để thêm nút back
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Để thêm icon back
import api from '../api/api';
import TrackItem from '../components/TrackItem';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getDownloadedTracks } from '../utils/DownloadManager';

export default function CategoryTracksScreen({ route, navigation }) {
  const { type, id, name } = route.params; // Lấy tham số: type ('album'/'artist'/'genre'), id (cho album/artist), name (cho genre/album/artist)
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playTrack } = useMusicPlayer();
   const [downloadedTracksMap, setDownloadedTracksMap] = useState({});

   // Tải danh sách đã tải về
  const loadDownloadedStatus = useCallback(async () => {
    const map = await getDownloadedTracks();
    setDownloadedTracksMap(map);
  }, []);

  // Hàm gọi API dựa trên type
  const fetchTracks = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setTracks([]); // Xóa list cũ trước khi fetch
    try {
      let response;
      console.log(`Fetching tracks for ${type}: ${id || name}`); // Debug log
      if (type === 'album' && id) {
        response = await api.getAlbumTracks(id);
      } else if (type === 'artist' && id) {
        response = await api.getArtistTracks(id);
      } else if (type === 'genre' && name) {
        // API getTracksByGenre hiện tại không phân trang trong api.js, gọi bản không phân trang
         response = await api.getTracksByGenre(name);
        // Nếu API backend có phân trang cho genre:
        // response = await api.getTracksByGenre(name, 0, 50); // Lấy 50 bài đầu
      } else {
        console.error("Invalid parameters for CategoryTracksScreen:", route.params);
        Alert.alert("Lỗi", "Tham số không hợp lệ.");
        navigation.goBack();
        return;
      }

      setTracks(response?.data || []); // Cập nhật state, đảm bảo là mảng
    } catch (error) {
      console.error(`Error fetching ${type} tracks:`, error);
      Alert.alert("Lỗi", `Không thể tải danh sách bài hát theo ${type}.`);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [type, id, name, navigation]); // Thêm navigation vào dependencies

  // Effect để tải dữ liệu khi màn hình mount hoặc tham số thay đổi
  useEffect(() => {
    loadDownloadedStatus(); // Tải trạng thái download
    fetchTracks(); // Tải danh sách tracks
  }, [fetchTracks, loadDownloadedStatus]); // Thêm loadDownloadedStatus

   // Xử lý refresh
   const onRefresh = useCallback(() => {
     setLoading(true); // Bắt đầu trạng thái refresh
     Promise.all([fetchTracks(false), loadDownloadedStatus()]) // Tải lại cả 2, fetchTracks không set loading nữa
        .finally(() => setLoading(false)); // Kết thúc trạng thái refresh
   }, [fetchTracks, loadDownloadedStatus]);

  // Render Item
  const renderTrack = ({ item }) => (
    <TrackItem
      track={item}
      // isFavorite={...} // Cần logic check favorite
      // onToggleFavorite={...}
      onPress={(trackData, uri) => {
        playTrack(trackData, uri);
        navigation.navigate('Player'); // Điều hướng đến Player
      }}
       onDownloadsChange={loadDownloadedStatus} // Cập nhật download status
    />
  );

  // Lấy tiêu đề phù hợp
  const getHeaderTitle = () => {
    switch (type) {
      case 'album': return `Album: ${name || 'Đang tải...'}`;
      case 'artist': return `Nghệ sĩ: ${name || 'Đang tải...'}`;
      case 'genre': return `Thể loại: ${name || 'Đang tải...'}`;
      default: return 'Danh sách bài hát';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header tùy chỉnh */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{getHeaderTitle()}</Text>
         <View style={{ width: 30 }} />{/* Placeholder để căn giữa title */}
      </View>

      {loading && tracks.length === 0 ? ( // Chỉ hiển thị loading lớn khi đang tải lần đầu và list rỗng
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#9C27B0" />
        </View>
      ) : tracks.length === 0 ? (
          <Text style={styles.emptyText}>Không tìm thấy bài hát nào.</Text>
      ) : (
        <FlatList
          data={tracks}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
           refreshControl={
             <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={["#9C27B0"]}/>
           }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // Thêm style cho iOS status bar
    paddingTop: Platform.OS === 'ios' ? 40 : 12,
     height: Platform.OS === 'ios' ? 90 : 60, // Chiều cao header
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
   emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: '#666',
  },
  list: {
    paddingTop: 10,
    paddingBottom: 80, // Đủ không gian cho MiniPlayer nếu có ở layout cha
  },
});