// src/screens/HomeScreen.js
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
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Danh sách thể loại mẫu
const GENRES = ['Indie', 'V-Pop', 'Rap', 'R&B', 'Ballad', 'EDM', 'Acoustic'];

export default function HomeScreen({ navigation }) {
  // --- SỬA Ở ĐÂY: Lấy playQueue thay vì playTrack ---
  const { playQueue, userId } = useMusicPlayer();

  const [tracks, setTracks] = useState([]); // Đổi tên: recommendations -> tracks (giữ nguyên để ít thay đổi hơn)
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false); // Loading cho "Gợi ý" / Search
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [trending, setTrending] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [artists, setArtists] = useState([]);
  const [downloadedTracksMap, setDownloadedTracksMap] = useState({});

  // --- Tải dữ liệu ---
  const loadDownloadedStatus = useCallback(async () => {
    // console.log("HomeScreen: Loading download statuses...");
    const map = await getDownloadedTracks();
    setDownloadedTracksMap(map);
  }, []);

  // Đổi tên: loadTracks -> loadRecommendations (giữ nguyên tên state `tracks` ở trên)
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
  }, [tracks.length, userId]);

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
      // Gọi api.searchTracks với 3 tham số
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
      loadRecommendations(false); // Load lại recommendations khi xóa hết search query
    }
  };

  // --- Effects ---
  useEffect(() => {
    loadRecommendations(true);
    loadTrending();
    loadAlbums();
    loadArtists();
  }, []); // Chỉ chạy 1 lần khi mount

  useFocusEffect(useCallback(() => {
    loadDownloadedStatus();
  }, [loadDownloadedStatus]));

  // --- Điều hướng ---
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
  // --- SỬA Ở ĐÂY: renderTrack nhận thêm 'list' ---
  const renderTrack = ({ item, index, list }) => (
    <TrackItem
      key={`track-${item.id}-${index}`}
      track={item}
      onPress={(trackData, uri) => { // trackData chính là item, uri là từ TrackItem
        // --- SỬA Ở ĐÂY: Gọi playQueue ---
        console.log(`Playing track ${index} from list of ${list.length}`);
        playQueue(list, index); // Gọi playQueue với danh sách và index
        navigation.navigate('Player');
      }}
      onDownloadsChange={loadDownloadedStatus}
      // isFavorite={...} // Bạn có thể thêm logic kiểm tra favorite nếu cần
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
            loadRecommendations(false), // Tải lại recommendations
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
  }, [loadRecommendations, loadTrending, loadAlbums, loadArtists, loadDownloadedStatus]);


  // --- Return JSX ---
  return (
    <SafeAreaView style={styles.outerContainer} edges={['right', 'left']}>
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
                  // --- SỬA Ở ĐÂY: Truyền list vào renderTrack ---
                  renderItem={({ item, index }) => renderTrack({ item, index, list: trending })}
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
              contentContainerStyle={styles.horizontalListCards} // Đổi thành card style để padding đều
          />

          {/* Main Track List Section (Gợi ý/Tìm kiếm) */}
          <Text style={styles.sectionTitle}>🎧 {searchQuery ? 'Kết quả tìm kiếm' : 'Gợi ý cho bạn'}</Text>
          {loading && tracks.length === 0 ? ( // Chỉ hiện loading khi list rỗng
              <View style={styles.centerLoader}>
                  <ActivityIndicator size="large" color="#9C27B0" />
              </View>
          ) : tracks.length === 0 ? (
              <Text style={styles.emptyText}>{searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Không có gợi ý nào.'}</Text>
          ): (
              <View style={styles.trackListContainer}>
                  {/* --- SỬA Ở ĐÂY: Truyền list vào renderTrack --- */}
                  {tracks.map((item, index) => renderTrack({ item, index, list: tracks, key: item.id }))}
              </View>
          )}

      </ScrollView>

      {/* Mini Player */}
      <MiniPlayer navigation={navigation} />
    </SafeAreaView>
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
    marginTop: 60,
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    backgroundColor: '#fff',
    borderRadius: 25,
    fontSize: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 12,
    color: '#222',
  },
   horizontalLoader: {
     height: 150,
     justifyContent: 'center',
     alignItems: 'center',
   },
  horizontalListTracks: { // Dùng cho Trending
    paddingLeft: 16,
    paddingRight: 8, // Để có khoảng trống cuối list
  },
   horizontalListCards: { // Dùng cho Album, Artist, Genre
    paddingLeft: 16,
    paddingRight: 4, // Giảm padding vì card đã có marginRight
    paddingBottom: 5,
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
     width: 140,
     marginRight: 12,
     backgroundColor: '#fff',
     borderRadius: 8,
     elevation: 2,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 3,
     marginBottom: 5, // Thêm margin bottom nhỏ
   },
   cardImage: {
     width: 140,
     height: 140,
     borderTopLeftRadius: 8,
     borderTopRightRadius: 8,
     backgroundColor: '#eee', // Placeholder color
   },
   artistImage: {
       borderRadius: 70, // Bo tròn cho ảnh nghệ sĩ
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
   cardSubtitle: { // Dùng cho tên nghệ sĩ dưới album
       fontSize: 12,
       color: '#888',
       textAlign: 'center',
       paddingHorizontal: 8,
       paddingBottom: 8,
   },
   // --- Track List Styles ---
   trackListContainer: {
     // Không cần style đặc biệt, TrackItem tự có margin
     paddingBottom: 5, // Thêm padding bottom nhỏ
   },
  centerLoader: { // Dùng cho loading chính giữa màn hình
      marginTop: 50,
      paddingBottom: 20,
      alignItems: 'center',
  },
  emptyText: { // Dùng khi không có track gợi ý/tìm kiếm
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: '#666',
      paddingHorizontal: 20,
  },
   emptyTextSmall: { // Dùng khi không có trending/album/artist
       marginLeft: 16,
       fontSize: 14,
       color: '#888',
       marginVertical: 10, // Thêm margin dọc
   },
});