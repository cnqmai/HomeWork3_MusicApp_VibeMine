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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';
import api from '../api/api';
import { useMusicPlayer } from '../hooks/useMusicPlayer';

export default function PlaylistsScreen({ navigation }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { playTrack } = useMusicPlayer();
  const userId = 1;

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getUserPlaylists(userId);
      setPlaylists(data);
    } catch (error) {
      console.error('Load playlists error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPlaylistTracks = async (playlistId) => {
    try {
      const { data } = await api.getPlaylistDetail(playlistId);
      setPlaylistTracks(data.tracks || []);
      setSelectedPlaylist(data);
    } catch (error) {
      console.error('Load playlist tracks error:', error);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên playlist');
      return;
    }
    try {
      await api.createPlaylist(userId, newPlaylistName.trim());
      setShowCreateModal(false);
      setNewPlaylistName('');
      loadPlaylists();
      Alert.alert('Thành công', 'Tạo playlist thành công!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo playlist');
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const renderPlaylist = ({ item }) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      onPress={() => loadPlaylistTracks(item.id)}
    >
      <Ionicons name="musical-notes-outline" size={40} color="#9C27B0" />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle}>{item.name}</Text>
        <Text style={styles.playlistCount}>
          {item.trackCount || 0} bài hát
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  if (selectedPlaylist) {
    return (
      <View style={styles.container}>
        <View style={styles.playlistHeader}>
          <TouchableOpacity 
            onPress={() => {
              setSelectedPlaylist(null);
              setPlaylistTracks([]);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.selectedTitle}>{selectedPlaylist.name}</Text>
        </View>
        
        <FlatList
          data={playlistTracks}
          renderItem={({ item }) => (
            <TrackItem 
              track={item} 
              onPress={() => {
                playTrack(item);
                navigation.navigate('Player');
              }}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.trackList}
          refreshing={loading}
          onRefresh={() => loadPlaylistTracks(selectedPlaylist.id)}
        />
        <MiniPlayer navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎼 Playlists của bạn</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        renderItem={renderPlaylist}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.playlistList}
        refreshing={loading}
        onRefresh={loadPlaylists}
      />

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo playlist mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên playlist..."
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButtonModal}
                onPress={createPlaylist}
              >
                <Text style={styles.createText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <MiniPlayer navigation={navigation} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 12,
  },
  playlistList: {
    paddingBottom: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  playlistCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    padding: 16,
  },
  selectedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
    flex: 1,
  },
  trackList: {
    paddingBottom: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelButton: {
    padding: 12,
    flex: 1,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  createButtonModal: {
    backgroundColor: '#9C27B0',
    padding: 12,
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 12,
  },
  createText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});