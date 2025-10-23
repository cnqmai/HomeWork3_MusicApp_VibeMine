import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer'; // Giữ lại MiniPlayer nếu màn hình này không nằm trong Tab
import api from '../api/api';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { storage } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { getDownloadedTracks } from '../utils/DownloadManager'; // Import download manager
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlaylistsScreen({ navigation }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // Lưu thông tin playlist đang xem {id, name, tracks?}
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { playTrack, userId } = useMusicPlayer(); // Change this line to destructure both playTrack and userId
  const [downloadedTracksMap, setDownloadedTracksMap] = useState({});

  // --- Tải dữ liệu ---
   // Tải danh sách đã tải về
   const loadDownloadedStatus = useCallback(async () => {
    // console.log("PlaylistScreen: Loading download statuses..."); // Debug log
    const map = await getDownloadedTracks();
    setDownloadedTracksMap(map);
  }, []);

  // Tải danh sách playlists từ API và cập nhật local storage
  const fetchAndSyncPlaylists = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoadingPlaylists(true);
    try {
      // console.log("PlaylistScreen: Fetching playlists from API..."); // Debug
      const { data } = await api.getUserPlaylists(userId);
      const validData = Array.isArray(data) ? data : [];
      setPlaylists(validData);
      await storage.savePlaylists(validData);
      // console.log("PlaylistScreen: Playlists fetched and saved:", validData.length); // Debug
    } catch (error) {
      console.error('PlaylistScreen: Load playlists API error:', error);
      // Alert.alert("Lỗi", "Không thể cập nhật danh sách playlist.");
    } finally {
      if (showLoadingIndicator) setLoadingPlaylists(false);
       setInitialLoading(false); // Luôn tắt initial loading sau lần fetch đầu
    }
  }, [userId]);

  // Tải danh sách playlists ban đầu và khi focus (nếu không xem chi tiết)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadInitialPlaylists = async () => {
        // console.log("PlaylistsScreen focused, loading initial playlists...");// Debug
        if (isActive) setInitialLoading(true);

         // 1. Tải trạng thái download
         await loadDownloadedStatus();

        // 2. Tải từ AsyncStorage
        const localPlaylists = await storage.getPlaylists();
         // console.log("PlaylistScreen: Loaded local playlists:", localPlaylists?.length); // Debug
         const validLocalData = Array.isArray(localPlaylists) ? localPlaylists : [];
        if (isActive && validLocalData.length > 0) {
          setPlaylists(validLocalData);
           setInitialLoading(false); // Tắt loading nếu có local data
        } else if (isActive) {
           setPlaylists([]); // Set rỗng nếu không có local data
        }

        // 3. Fetch từ API (chạy ngầm nếu có local data)
        await fetchAndSyncPlaylists(validLocalData.length === 0);
      };

      // Chỉ tải lại khi đang ở màn hình danh sách playlist
      if (!selectedPlaylist && isActive) {
        loadInitialPlaylists();
      } else if (isActive) {
         // Nếu đang xem chi tiết, vẫn tắt initialLoading nếu nó đang bật
         setInitialLoading(false);
      }

      return () => { isActive = false; /*console.log("PlaylistsScreen unfocused/unmounted.");*/}; // Debug
    }, [fetchAndSyncPlaylists, selectedPlaylist, loadDownloadedStatus]) // Thêm loadDownloadedStatus
  );

  // Tải chi tiết tracks của playlist
  const loadPlaylistTracks = async (playlistId, playlistName) => {
    setLoadingTracks(true);
    // Hiển thị tên tạm thời trong khi tải
    setSelectedPlaylist({ id: playlistId, name: playlistName || 'Đang tải...', tracks: [] });
    setPlaylistTracks([]);
    try {
      // console.log(`PlaylistScreen: Fetching details for playlist ${playlistId}...`); // Debug
      const { data } = await api.getPlaylistDetail(playlistId);
      if (data) {
         const tracks = Array.isArray(data.tracks) ? data.tracks : [];
        setPlaylistTracks(tracks);
        setSelectedPlaylist(data); // Cập nhật đầy đủ thông tin
         // console.log(`PlaylistScreen: Loaded ${tracks.length} tracks for playlist ${playlistId}`); // Debug
      } else {
        throw new Error("API returned no data for playlist detail");
      }
    } catch (error) {
      console.error('PlaylistScreen: Load playlist tracks error:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết playlist.');
      setSelectedPlaylist(null); // Quay lại màn hình danh sách nếu lỗi
    } finally {
      setLoadingTracks(false);
    }
  };

  // Tạo playlist mới
  const createPlaylist = async () => {
    const trimmedName = newPlaylistName.trim();
    if (!trimmedName) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên playlist');
      return;
    }
    // Đóng modal trước khi gọi API
    setShowCreateModal(false);
    setNewPlaylistName('');
    try {
      // console.log(`PlaylistScreen: Creating playlist: ${trimmedName}`); // Debug
      const { data: newPlaylist } = await api.createPlaylist(userId, trimmedName);
       if (newPlaylist && newPlaylist.id) { // Kiểm tra có ID trả về
           // Cập nhật state và AsyncStorage
            const updatedPlaylists = [...playlists, newPlaylist];
            setPlaylists(updatedPlaylists);
            await storage.savePlaylists(updatedPlaylists);
            // console.log("PlaylistScreen: Playlist created successfully:", newPlaylist); // Debug
            Alert.alert('Thành công', 'Tạo playlist thành công!');
       } else {
            throw new Error("API did not return a valid new playlist object");
       }

    } catch (error) {
      console.error("PlaylistScreen: Create playlist error:", error);
      Alert.alert('Lỗi', 'Không thể tạo playlist. Vui lòng thử lại.');
      // Không cần hoàn tác UI vì modal đã đóng
    }
  };

   // --- Xử lý Refresh ---
   const onRefreshPlaylists = useCallback(() => {
     // Tải lại cả trạng thái download và danh sách playlist
    // console.log("PlaylistScreen: Refreshing playlist list..."); // Debug
    setLoadingPlaylists(true);
     Promise.all([loadDownloadedStatus(), fetchAndSyncPlaylists(false)]) // fetch không cần set loading nữa
        .finally(() => setLoadingPlaylists(false));
  }, [fetchAndSyncPlaylists, loadDownloadedStatus]);


  // --- Render Items ---
  const renderPlaylist = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => loadPlaylistTracks(item.id, item.name)}
    >
      <Ionicons name="list-outline" size={30} color="#8A2BE2" />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={1}>
          {item?.name || ''}
        </Text>
        <Text style={styles.playlistCount}>
          {item?.trackCount === 1 ? (
            <Text>1 bài hát</Text>
          ) : (
            <Text>{`${item?.trackCount || 0} bài hát`}</Text>
          )}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderTrack = ({ item }) => (
    <TrackItem
      track={item}
      onPress={(trackData, uri) => {
        playTrack(trackData, uri); // Use playTrack directly
        navigation.navigate('Player');
      }}
      isFavorite={false}
      onDownloadsChange={loadDownloadedStatus}
    />
  );
  
  // --- Render Chi tiết Playlist ---
  if (selectedPlaylist) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'left']}>
        <View style={styles.playlistHeader}>
          <TouchableOpacity
            onPress={() => setSelectedPlaylist(null)} // Chỉ cần set null để quay lại
             style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.selectedTitle} numberOfLines={1}>
            {selectedPlaylist?.name || ''}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {loadingTracks ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#9C27B0" />
             </View>
        ) : playlistTracks.length === 0 ? (
             <Text style={styles.emptyText}>Playlist này chưa có bài hát nào.</Text>
        ) : (
          <FlatList
            data={playlistTracks}
            renderItem={renderTrack}
            keyExtractor={(item) => `${item.id}-${item.title}`} // Key unique hơn
            contentContainerStyle={styles.trackList}
             // Optional: Refresh chi tiết playlist
             // refreshControl={
             //   <RefreshControl refreshing={loadingTracks} onRefresh={() => loadPlaylistTracks(selectedPlaylist.id, selectedPlaylist.name)} colors={["#9C27B0"]}/>
             // }
          />
        )}
        {/* MiniPlayer có thể cần thiết ở đây nếu màn hình này không phải là tab */}
        <MiniPlayer navigation={navigation} />
      </SafeAreaView>
    );
  }

  // --- Render Danh sách Playlists ---
   if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['right', 'left']}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎼 Playlists</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 && !loadingPlaylists ? (
        <Text style={styles.emptyText}>
          Bạn chưa tạo playlist nào. Nhấn + để tạo.
        </Text>
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderPlaylist}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.playlistList}
          refreshControl={
            <RefreshControl
              refreshing={loadingPlaylists}
              onRefresh={onRefreshPlaylists}
              colors={["#9C27B0"]}
            />
          }
        />
      )}

      {/* Modal tạo playlist */}
      <Modal
          visible={showCreateModal}
          animationType="fade" // Đổi animation
          transparent
          onRequestClose={() => setShowCreateModal(false)} // Cho phép đóng bằng nút back Android
          >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo playlist mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên playlist..."
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholderTextColor="#999"
              autoFocus={true} // Tự động focus input
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButtonModal]}
                onPress={createPlaylist}
              >
                <Text style={styles.createText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MiniPlayer có thể cần thiết ở đây nếu màn hình này không phải là tab */}
       <MiniPlayer navigation={navigation} />
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Sáng hơn
  },
   center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 40, // Add top margin to push header down
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // Xóa paddingTop vì đã có SafeAreaView
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#9C27B0',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playlistList: {
    paddingBottom: 120, // Tăng padding để MiniPlayer không che
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
    elevation: 1,
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  playlistCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    paddingVertical: 12,
    paddingHorizontal: 15,
     paddingTop: Platform.OS === 'android' ? 12 : 40, // Adjust padding for status bar
     minHeight: Platform.OS === 'android' ? 56 : 80, // Ensure header height
  },
   backButton: {
    padding: 5,
    marginRight: 10,
     position: 'absolute', // Position absolute for back button
     left: 15,
     top: Platform.OS === 'android' ? 14 : 42, // Adjust top position
     zIndex: 1,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    // marginHorizontal: 50, // Remove horizontal margin to allow centering
  },
  trackList: {
    paddingBottom: 120, // Tăng padding để MiniPlayer không che
  },
   emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: '#666',
      paddingHorizontal: 20, // Thêm padding để text không quá dài
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
   modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  cancelText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  createButtonModal: {
    backgroundColor: '#9C27B0',
  },
  createText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});