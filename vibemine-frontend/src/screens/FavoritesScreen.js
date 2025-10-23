import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert, // Thêm Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackItem from '../components/TrackItem';
import api from '../api/api';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { storage } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { getDownloadedTracks } from '../utils/DownloadManager'; // Import download manager

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false); // Loading cho refresh/sync
  const [initialLoading, setInitialLoading] = useState(true); // Loading lần đầu
  const { playTrack, currentTrack } = useMusicPlayer(); // Lấy currentTrack để kiểm tra favorite
  const userId = 1;
  const [downloadedTracksMap, setDownloadedTracksMap] = useState({});

   // --- Tải dữ liệu ---
   // Tải danh sách đã tải về
   const loadDownloadedStatus = useCallback(async () => {
    // console.log("FavoritesScreen: Loading download statuses..."); // Debug log
    const map = await getDownloadedTracks();
    setDownloadedTracksMap(map);
  }, []);

  // Hàm tải dữ liệu từ API và cập nhật local storage
  const fetchAndSyncFavorites = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    try {
      // console.log("FavoritesScreen: Fetching favorites from API..."); // Debug log
      const { data } = await api.getUserFavorites(userId);
      const validData = Array.isArray(data) ? data : []; // Đảm bảo là mảng
      setFavorites(validData);
      await storage.saveFavorites(validData);
      // console.log("FavoritesScreen: Favorites fetched and saved:", validData.length); // Debug log
    } catch (error) {
      console.error('FavoritesScreen: Load favorites API error:', error);
      // Giữ lại dữ liệu cũ nếu API lỗi? Hoặc thông báo lỗi
      // Alert.alert("Lỗi", "Không thể cập nhật danh sách yêu thích.");
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
       // Luôn tắt initialLoading sau lần fetch đầu tiên, kể cả khi lỗi
       setInitialLoading(false);
    }
  }, [userId]);

  // Tải dữ liệu ban đầu và khi focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadInitialData = async () => {
        // console.log("FavoritesScreen focused, loading initial data..."); // Debug log
        if (isActive) setInitialLoading(true); // Chỉ set initialLoading khi màn hình active

        // 1. Tải trạng thái download
        await loadDownloadedStatus();

        // 2. Tải từ AsyncStorage trước
        const localFavorites = await storage.getFavorites();
        // console.log("FavoritesScreen: Loaded local favorites:", localFavorites?.length); // Debug log
        if (isActive && Array.isArray(localFavorites) && localFavorites.length > 0) {
          setFavorites(localFavorites);
           // Tắt initial loading nếu đã có dữ liệu local
           setInitialLoading(false);
        } else if (isActive) {
            // Nếu không có dữ liệu local, vẫn set mảng rỗng và đợi API
            setFavorites([]);
        }


        // 3. Fetch từ API để đồng bộ (chạy ngầm nếu đã có local data)
        // Chỉ hiện loading nếu chưa có data local
        await fetchAndSyncFavorites(localFavorites.length === 0);
      };

      loadInitialData();

      return () => {
        isActive = false;
        // console.log("FavoritesScreen unfocused/unmounted."); // Debug log
      };
    }, [fetchAndSyncFavorites, loadDownloadedStatus]) // Thêm loadDownloadedStatus
  );

    // --- Xử lý bỏ yêu thích ---
    const handleToggleFavorite = useCallback(async (trackId) => {
        // Vì đây là màn hình Favorites, nhấn nút tim nghĩa là bỏ yêu thích
        Alert.alert(
            "Bỏ yêu thích",
            `Bạn có chắc muốn xóa "${favorites.find(t=>t.id === trackId)?.title || 'bài hát này'}" khỏi danh sách yêu thích?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        const previousFavorites = [...favorites]; // Lưu state cũ để hoàn tác
                        try {
                            // Cập nhật giao diện trước (Optimistic Update)
                            setFavorites(prev => prev.filter(t => t.id !== trackId));
                             console.log(`FavoritesScreen: Optimistically removed favorite ${trackId}`);

                            // Gọi API - Giả sử toggleFavorite trả về boolean hoặc throw error
                            // Cần điều chỉnh API call nếu backend trả về khác
                             // await api.toggleFavorite(userId, trackId); // Hoặc dùng API xóa riêng
                             await api.removeFromFavorites(userId, trackId); // Dùng API delete
                             console.log(`FavoritesScreen: API call successful for removing favorite ${trackId}`);


                            // Cập nhật AsyncStorage sau khi API thành công
                            const updatedFavorites = previousFavorites.filter(t => t.id !== trackId);
                            await storage.saveFavorites(updatedFavorites);
                            console.log(`FavoritesScreen: Removed favorite ${trackId}, updated storage.`);

                        } catch (error) {
                            console.error('FavoritesScreen: Error removing favorite:', error);
                             // Hoàn tác UI nếu có lỗi
                             setFavorites(previousFavorites);
                             Alert.alert("Lỗi", "Không thể bỏ yêu thích bài hát này. Vui lòng thử lại.");
                        }
                    },
                },
            ]
        );
    }, [favorites, userId]); // Phụ thuộc vào favorites và userId


  // --- Render Item ---
  const renderTrack = ({ item }) => (
    <TrackItem
      track={item}
      onPress={(trackData, uri) => { // Nhận track và uri
        // console.log(`FavoritesScreen: Playing ${trackData.title}, localUri: ${uri}`); // Debug log
        playTrack(trackData, uri);
        navigation.navigate('Player');
      }}
      isFavorite={true} // Luôn là true ở màn hình này
      onToggleFavorite={() => handleToggleFavorite(item.id)} // Hàm xử lý bỏ yêu thích
      onDownloadsChange={loadDownloadedStatus} // Cập nhật trạng thái download
    />
  );

  // --- Xử lý Refresh ---
  const onRefresh = useCallback(() => {
     // Khi refresh, tải lại cả trạng thái download và danh sách yêu thích
    // console.log("FavoritesScreen: Refreshing..."); // Debug log
    setLoading(true);
     Promise.all([loadDownloadedStatus(), fetchAndSyncFavorites(false)]) // fetch không cần set loading nữa
        .finally(() => setLoading(false));
  }, [fetchAndSyncFavorites, loadDownloadedStatus]);

  // --- Render Loading ban đầu ---
   if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['right', 'left']}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </SafeAreaView>
    );
  }

  // --- Render chính ---
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Text style={styles.title}>💖 Bài hát yêu thích</Text>
      {(favorites.length === 0 && !loading) ? (
           <Text style={styles.emptyText}>Chưa có bài hát yêu thích nào.</Text>
       ) : (
          <FlatList
            data={favorites}
            renderItem={renderTrack}
            keyExtractor={(item) => item.id.toString()} // Key đơn giản là đủ nếu ID unique
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={["#9C27B0"]} />
            }
          />
       )}
        {/* Tab Navigator quản lý MiniPlayer */}
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Màu nền sáng hơn chút
  },
  center: {
    flex: 1, // Chiếm hết không gian
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 40, // Add marginTop to push title down
    color: '#333',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  list: {
    paddingTop: 10, // Thêm padding top cho list
    paddingBottom: 80, // Tăng padding bottom nếu có MiniPlayer ở layout cha
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 60, // Tăng margin top
      fontSize: 16,
      color: '#777', // Màu chữ đậm hơn chút
  },
});