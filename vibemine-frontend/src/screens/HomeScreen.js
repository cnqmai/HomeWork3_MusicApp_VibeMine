import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  TextInput, // Sử dụng TextInput cơ bản
  TouchableOpacity,
  ScrollView, // Sử dụng ScrollView cho nội dung chính
  Alert, // Thêm Alert
  Platform, // Thêm Platform
} from 'react-native';
// import { Searchbar } from 'react-native-paper'; // Bỏ comment nếu muốn dùng Searchbar của Paper
import { Ionicons } from '@expo/vector-icons';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';
import api from '../api/api';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getDownloadedTracks } from '../utils/DownloadManager';
import { useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash.debounce';

const { width } = Dimensions.get('window');
const userId = 1; // Giả sử userId

// Danh sách thể loại mẫu (có thể lấy từ API nếu backend hỗ trợ)
const GENRES = ['Indie', 'V-Pop', 'Rap', 'R&B', 'Ballad', 'EDM', 'Acoustic'];

export default function HomeScreen({ navigation }) {
  const [tracks, setTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false); // Loading cho danh sách chính + tìm kiếm
  const [isRefreshing, setIsRefreshing] = useState(false); // State riêng cho RefreshControl
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [trending, setTrending] = useState([]);
  const { playTrack } = useMusicPlayer();
  const [downloadedTracksMap, setDownloadedTracksMap] = useState({});

  // --- Tải dữ liệu ---
  const loadDownloadedStatus = useCallback(async () => {
    // console.log("HomeScreen: Loading download statuses...");
    const map = await getDownloadedTracks();
    setDownloadedTracksMap(map);
  }, []);

  const loadTracks = useCallback(async (showLoading = true) => {
    // console.log("HomeScreen: Loading tracks...");
    if (showLoading && tracks.length === 0) setLoading(true); // Chỉ hiện loading toàn màn hình lần đầu
    try {
      const { data } = await api.getTracks(); // Lấy toàn bộ
      setTracks(data || []);
    } catch (error) {
      console.error('Load tracks error:', error);
      if (showLoading) Alert.alert("Lỗi", "Không thể tải danh sách bài hát.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [tracks.length]);

  const loadTrending = useCallback(async () => {
    // console.log("HomeScreen: Loading trending...");
    setLoadingTrending(true);
    try {
      const { data } = await api.getTrending(5);
      setTrending(data || []);
    } catch (error) { console.error('Load trending error:', error); }
    finally { setLoadingTrending(false); }
  }, []);

  // --- Tìm kiếm ---
  const performSearch = useCallback(async (query) => {
    // console.log(`HomeScreen: Performing search for "${query}"`);
    setLoading(true); // Luôn set loading khi search
    try {
      const { data } = await api.searchTracks(query);
      setTracks(data || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert("Lỗi", "Tìm kiếm thất bại.");
    } finally { setLoading(false); }
  }, []);

  const debouncedSearch = useCallback(debounce(performSearch, 400), [performSearch]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 0) {
      debouncedSearch(trimmedQuery);
    } else if (trimmedQuery.length === 0 && query.length === 0) {
      // console.log("HomeScreen: Search cleared, loading initial tracks.");
      loadTracks(false); // Load lại không hiển thị loading toàn màn hình
    }
  };

  // --- Effects ---
  useEffect(() => {
    loadTracks();
    loadTrending();
  }, []);

  useFocusEffect(useCallback(() => {
    // console.log("HomeScreen focused, reloading download statuses.");
    loadDownloadedStatus();
  }, [loadDownloadedStatus]));

  // --- Điều hướng ---
  const navigateToGenre = (genreName) => {
      navigation.navigate('CategoryTracks', {
          type: 'genre',
          name: genreName,
      });
  };

  // --- Render ---
  const renderTrack = ({ item, index }) => ( // Thêm index để dùng key
    <TrackItem
      key={`track-${item.id}-${index}`} // Key unique hơn
      track={item}
      onPress={(trackData, uri) => {
        // console.log(`HomeScreen: Playing ${trackData.title}, localUri: ${uri}`);
        playTrack(trackData, uri);
        navigation.navigate('Player');
      }}
      onDownloadsChange={loadDownloadedStatus}
      // isFavorite={...} // Add favorite logic here
      // onToggleFavorite={...}
    />
  );

   const renderGenreItem = ({ item }) => (
     <TouchableOpacity
       style={styles.genreButton}
       onPress={() => navigateToGenre(item)}
     >
       <Text style={styles.genreButtonText}>{item}</Text>
     </TouchableOpacity>
   );

  // Xử lý refresh
  const onRefresh = useCallback(async () => {
    // console.log("HomeScreen: Refreshing..."); // Debug log
    setIsRefreshing(true); // Bật indicator của RefreshControl
    try {
        // Tải lại đồng thời
        await Promise.all([
            loadTracks(false), // Không bật loading toàn màn hình
            loadTrending(),
            loadDownloadedStatus()
        ]);
    } catch (error) {
         console.error("Error during refresh:", error);
         // Có thể hiển thị thông báo lỗi nhỏ ở đây
    } finally {
        setIsRefreshing(false); // Tắt indicator
    }
  }, [loadTracks, loadTrending, loadDownloadedStatus]);

  // --- Return JSX ---
  return (
    // **** SỬA LỖI: BỌC TOÀN BỘ BẰNG VIEW ****
    <View style={styles.outerContainer}>
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#9C27B0"]}/>
            }
            keyboardShouldPersistTaps="handled" // Để có thể bấm nút khi bàn phím hiện
            >
            <TextInput
                placeholder="Tìm kiếm bài hát, ca sĩ..."
                onChangeText={handleSearchChange}
                value={searchQuery}
                style={styles.searchBar}
                placeholderTextColor="#888"
            />

            {/* Trending Section */}
            <Text style={styles.sectionTitle}>🎯 Trending</Text>
            {loadingTrending ? (
                <ActivityIndicator style={styles.horizontalLoader} color="#9C27B0" />
            ) : trending.length > 0 ? (
                <FlatList
                    data={trending}
                    renderItem={renderTrack}
                    keyExtractor={(item) => `trending-${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                />
            ) : (
                <Text style={styles.emptyTextSmall}>Không có dữ liệu trending.</Text>
            )}

            {/* Genre Section */}
            <Text style={styles.sectionTitle}>🎵 Thể loại</Text>
            <FlatList
                data={GENRES}
                renderItem={renderGenreItem}
                keyExtractor={(item) => `genre-${item}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList} // Dùng chung style list ngang
            />


            {/* Main Track List Section */}
            <Text style={styles.sectionTitle}>🎧 {searchQuery ? 'Kết quả tìm kiếm' : 'Gợi ý cho bạn'}</Text>
            {loading && tracks.length === 0 ? ( // Loading lần đầu/tìm kiếm khi list rỗng
                <View style={styles.centerLoader}>
                    <ActivityIndicator size="large" color="#9C27B0" />
                </View>
            ) : tracks.length === 0 ? ( // List rỗng sau khi load xong
                <Text style={styles.emptyText}>{searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Không có bài hát nào.'}</Text>
            ): (
                // Render danh sách tracks (dùng map)
                <View style={styles.trackListContainer}>
                    {tracks.map((item, index) => renderTrack({ item, index }))}
                </View>
            )}

            {/* Khoảng trống dưới cùng để không bị che bởi MiniPlayer */}
            {/* Đã chuyển vào contentContainerStyle của ScrollView */}

        </ScrollView>

        {/* Mini Player đặt ở đây, nằm trên ScrollView */}
        <MiniPlayer navigation={navigation} />
    </View> // **** KẾT THÚC VIEW CHA ****
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  outerContainer: { // Style cho View cha bao bọc tất cả
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: { // Style cho ScrollView
    flex: 1, // Để ScrollView chiếm không gian còn lại (trên MiniPlayer)
  },
  scrollViewContent: { // Style cho nội dung bên trong ScrollView
     paddingBottom: 80, // Tăng padding bottom đủ cho MiniPlayer
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 10, // Tăng margin bottom
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    backgroundColor: '#fff',
    borderRadius: 25,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1, // Thêm border nhẹ
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700', // Đậm hơn chút
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
   horizontalLoader: { // Style cho loading indicator của list ngang
     height: 100, // Chiều cao tạm thời để giữ layout
     justifyContent: 'center',
     alignItems: 'center',
   },
  horizontalList: { // Style chung cho FlatList ngang
    paddingLeft: 16,
    paddingRight: 8, // Đủ để thấy item cuối
  },
   // --- Genre Styles ---
   genreList: { // Dùng chung horizontalList style
     paddingLeft: 16,
     paddingRight: 8,
     marginBottom: 10,
   },
   genreButton: {
     backgroundColor: '#fff', // Nền trắng
     paddingHorizontal: 18,
     paddingVertical: 10,
     borderRadius: 20,
     marginRight: 10,
     borderWidth: 1, // Thêm border
     borderColor: '#ddd',
     elevation: 1, // Thêm shadow nhẹ
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
   },
   genreButtonText: {
     fontSize: 14,
     fontWeight: '500',
     color: '#555', // Màu chữ đậm hơn
   },
   // --- Track List Styles ---
   trackListContainer: {
     paddingBottom: 5, // Không cần nhiều padding vì đã có ở ScrollView
   },
  centerLoader: {
      marginTop: 50,
      alignItems: 'center',
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: '#666',
      paddingHorizontal: 20,
  },
   emptyTextSmall: {
       marginLeft: 16,
       fontSize: 14,
       color: '#888',
       marginVertical: 10, // Thêm margin dọc
   },
});