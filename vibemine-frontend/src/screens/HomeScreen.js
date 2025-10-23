import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';
import api from '../api/api';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getDownloadedTracks } from '../utils/DownloadManager';
import { useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash.debounce';

const { width } = Dimensions.get('window');

// Danh sách thể loại mẫu
const GENRES = ['Indie', 'V-Pop', 'Rap', 'R&B', 'Ballad', 'EDM', 'Acoustic'];

export default function HomeScreen({ navigation }) {
  const [tracks, setTracks] = useState([]); // Đổi tên: recommendations
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false); // Loading cho "Gợi ý" / Search
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [trending, setTrending] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [artists, setArtists] = useState([]);
  const { playTrack, userId } = useMusicPlayer(); // Lấy userId từ hook
  const [downloadedTracksMap, setDownloadedTracksMap] = useState({});

  // --- Tải dữ liệu ---
  const loadDownloadedStatus = useCallback(async () => {
    // console.log("HomeScreen: Loading download statuses...");
    const map = await getDownloadedTracks();
    setDownloadedTracksMap(map);
  }, []);

  // --- CẬP NHẬT (FR-8.1) ---
  // Đổi tên: loadTracks -> loadRecommendations
  const loadRecommendations = useCallback(async (showLoading = true) => {
    console.log("HomeScreen: Loading recommendations...");
    if (showLoading && tracks.length === 0) setLoading(true);
    try {
      // Gọi API gợi ý
      const { data } = await api.getRecommendations(userId);
      setTracks(data || []); // Cập nhật state
    } catch (error) {
      console.error('Load recommendations error:', error);
      if (showLoading) Alert.alert("Lỗi", "Không thể tải gợi ý cho bạn.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [tracks.length, userId]); // Thêm userId
  // --- KẾT THÚC CẬP NHẬT ---

  const loadTrending = useCallback(async () => {
    setLoadingTrending(true);
    try {
      const { data } = await api.getTrending(10);
      setTrending(data || []);
    } catch (error) { console.error('Load trending error:', error); }
    finally { setLoadingTrending(false); }
  }, []);

  const loadAlbums = useCallback(async () => {
    setLoadingAlbums(true);
    try {
      const { data } = await api.getAlbums(0, 10);
      setAlbums(data || []);
    } catch (error) { console.error('Load albums error:', error); }
    finally { setLoadingAlbums(false); }
  }, []);

  const loadArtists = useCallback(async () => {
    setLoadingArtists(true);
    try {
      const { data } = await api.getArtists(0, 10);
      setArtists(data || []);
    } catch (error) { console.error('Load artists error:', error); }
    finally { setLoadingArtists(false); }
  }, []);

  // --- Tìm kiếm ---
  const performSearch = useCallback(async (query) => {
    console.log(`HomeScreen: Performing search for "${query}"`);
    setLoading(true);
    try {
      // Sửa: Gọi api.searchTracks với 3 tham số
      const { data } = await api.searchTracks(query, 0, 50); 
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
      console.log("HomeScreen: Search cleared, loading recommendations.");
      loadRecommendations(false); // CẬP NHẬT: Load lại recommendations
    }
  };

  // --- Effects ---
  useEffect(() => {
    loadRecommendations(true); // CẬP NHẬT
    loadTrending();
    loadAlbums();
    loadArtists();
  }, []); // Bỏ dependencies để chỉ chạy 1 lần

  useFocusEffect(useCallback(() => {
    loadDownloadedStatus();
  }, [loadDownloadedStatus]));

  // --- Điều hướng (Giữ nguyên) ---
  const navigateToGenre = (genreName) => {
      navigation.navigate('CategoryTracks', { type: 'genre', name: genreName });
  };
  const navigateToAlbum = (album) => {
       navigation.navigate('CategoryTracks', { type: 'album', id: album.id, name: album.title });
  };
  const navigateToArtist = (artist) => {
       navigation.navigate('CategoryTracks', { type: 'artist', id: artist.id, name: artist.name });
  };


  // --- Render ---
  const renderTrack = ({ item, index }) => (
    <TrackItem
      key={`track-${item.id}-${index}`}
      track={item}
      onPress={(trackData, uri) => {
        playTrack(trackData, uri);
        navigation.navigate('Player');
      }}
      onDownloadsChange={loadDownloadedStatus}
      // isFavorite={...}
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

   const renderAlbumItem = ({ item }) => (
       <TouchableOpacity style={styles.cardItem} onPress={() => navigateToAlbum(item)}>
           <Image source={{ uri: item.coverArtUrl || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
           <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
           <Text style={styles.cardSubtitle} numberOfLines={1}>{item.artist?.name || 'Nhiều nghệ sĩ'}</Text>
       </TouchableOpacity>
   );

   const renderArtistItem = ({ item }) => (
       <TouchableOpacity style={styles.cardItem} onPress={() => navigateToArtist(item)}>
           <Image source={{ uri: item.avatarUrl || 'https://via.placeholder.com/150' }} style={[styles.cardImage, styles.artistImage]} />
           <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
       </TouchableOpacity>
   );

  // Xử lý refresh
  const onRefresh = useCallback(async () => {
    console.log("HomeScreen: Refreshing...");
    setIsRefreshing(true);
    try {
        await Promise.all([
            loadRecommendations(false), // CẬP NHẬT
            loadTrending(),
            loadAlbums(),
            loadArtists(),
            loadDownloadedStatus()
        ]);
    } catch (error) {
         console.error("Error during refresh:", error);
         Alert.alert("Lỗi", "Không thể làm mới dữ liệu.");
    } finally {
        setIsRefreshing(false);
    }
  }, [loadRecommendations, loadTrending, loadAlbums, loadArtists, loadDownloadedStatus]); // CẬP NHẬT


  // --- Return JSX (Đã sửa lỗi JSX) ---
  return (
    <View style={styles.outerContainer}>
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#9C27B0"]}/>
            }
            keyboardShouldPersistTaps="handled"
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
                    contentContainerStyle={styles.horizontalListTracks}
                />
            ) : (
                <Text style={styles.emptyTextSmall}>Không có dữ liệu trending.</Text>
            )}

            {/* Artist Section */}
            <Text style={styles.sectionTitle}>🎤 Nghệ Sĩ Nổi Bật</Text>
            {loadingArtists ? (
                 <ActivityIndicator style={styles.horizontalLoader} color="#9C27B0" />
             ) : artists.length > 0 ? (
                 <FlatList
                    data={artists}
                    renderItem={renderArtistItem}
                    keyExtractor={(item) => `artist-${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalListCards}
                 />
             ) : (
                  <Text style={styles.emptyTextSmall}>Không có dữ liệu nghệ sĩ.</Text>
             )}

            {/* Album Section */}
            <Text style={styles.sectionTitle}>💽 Album Mới</Text>
             {loadingAlbums ? (
                 <ActivityIndicator style={styles.horizontalLoader} color="#9C27B0" />
             ) : albums.length > 0 ? (
                 <FlatList
                    data={albums}
                    renderItem={renderAlbumItem}
                    keyExtractor={(item) => `album-${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalListCards}
                 />
             ) : (
                  <Text style={styles.emptyTextSmall}>Không có dữ liệu album.</Text>
             )}

            {/* Genre Section */}
            <Text style={styles.sectionTitle}>🎵 Thể loại</Text>
            <FlatList
                data={GENRES}
                renderItem={renderGenreItem}
                keyExtractor={(item) => `genre-${item}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListCards}
            />

            {/* Main Track List Section (CẬP NHẬT TIÊU ĐỀ) */}
            <Text style={styles.sectionTitle}>🎧 {searchQuery ? 'Kết quả tìm kiếm' : 'Gợi ý cho bạn'}</Text>
            {loading && tracks.length === 0 ? (
                <View style={styles.centerLoader}>
                    <ActivityIndicator size="large" color="#9C27B0" />
                </View>
            ) : tracks.length === 0 ? (
                <Text style={styles.emptyText}>{searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Không có bài hát nào.'}</Text>
            ): (
                <View style={styles.trackListContainer}>
                    {/* Sửa: Dùng `item.id` làm key */}
                    {tracks.map((item, index) => renderTrack({ item, index, key: item.id }))}
                </View>
            )}

        </ScrollView>

        {/* Mini Player đặt ở đây, nằm trên ScrollView */}
        <MiniPlayer navigation={navigation} />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
     paddingBottom: 80, // Khoảng trống cho MiniPlayer
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 10 : 15, // Chỉnh margin top
    marginBottom: 10,
    paddingHorizontal: 20, // Tăng padding
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    backgroundColor: '#fff',
    borderRadius: 25,
    fontSize: 15, // Giảm font size
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20, // Tăng font size
    fontWeight: 'bold', // Đậm hơn
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 12, // Tăng margin bottom
    color: '#222', // Màu đậm hơn
  },
   horizontalLoader: {
     height: 150, // Tăng chiều cao loading
     justifyContent: 'center',
     alignItems: 'center',
   },
  horizontalListTracks: {
    paddingLeft: 16,
    paddingRight: 8,
  },
   horizontalListCards: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 5, // Thêm padding bottom
  },
   genreList: {
     paddingLeft: 16,
     paddingRight: 8,
     marginBottom: 10,
   },
   genreButton: {
     backgroundColor: '#fff',
     paddingHorizontal: 18,
     paddingVertical: 10,
     borderRadius: 20,
     marginRight: 10,
     borderWidth: 1,
     borderColor: '#ddd',
     elevation: 1,
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
   },
   genreButtonText: {
     fontSize: 14,
     fontWeight: '500',
     color: '#555',
   },
   // Card Styles for Album/Artist
   cardItem: {
     width: 140, // Tăng kích thước card
     marginRight: 12,
     backgroundColor: '#fff',
     borderRadius: 8,
     elevation: 2,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 3,
     marginBottom: 5,
   },
   cardImage: {
     width: 140,
     height: 140, // Vuông
     borderTopLeftRadius: 8,
     borderTopRightRadius: 8,
     backgroundColor: '#eee',
   },
   artistImage: {
       borderRadius: 70, // Bo tròn (140 / 2)
   },
   cardTitle: {
     fontSize: 14,
     fontWeight: '600',
     color: '#444',
     paddingHorizontal: 8,
     paddingTop: 8,
     paddingBottom: 2,
     textAlign: 'center',
   },
   cardSubtitle: {
       fontSize: 12,
       color: '#888',
       textAlign: 'center',
       paddingHorizontal: 8,
       paddingBottom: 8,
   },
   // --- Track List Styles ---
   trackListContainer: {
     paddingBottom: 5,
   },
  centerLoader: {
      marginTop: 50,
      paddingBottom: 20,
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
       marginVertical: 10,
   },
});