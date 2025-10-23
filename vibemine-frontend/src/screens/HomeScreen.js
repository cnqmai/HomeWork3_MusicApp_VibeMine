import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';
import api from '../api/api';
import { useMusicPlayer } from '../hooks/useMusicPlayer';

const { width } = Dimensions.get('window');
const userId = 1;

export default function HomeScreen({ navigation }) {
  const [tracks, setTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState([]);
  const { playTrack } = useMusicPlayer();

  // FR-1.1: Load danh sách nhạc
  const loadTracks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getTracks(0, 20);
      setTracks(data);
    } catch (error) {
      console.error('Load tracks error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // FR-8.2: Load trending
  const loadTrending = useCallback(async () => {
    try {
      const { data } = await api.getTrending(5);
      setTrending(data);
    } catch (error) {
      console.error('Load trending error:', error);
    }
  }, []);

  // FR-1.3: Tìm kiếm
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const { data } = await api.searchTracks(query, 0, 20);
        setTracks(data);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      loadTracks();
    }
  };

  useEffect(() => {
    loadTracks();
    loadTrending();
  }, [loadTracks, loadTrending]);

  const renderTrack = ({ item }) => (
    <TrackItem 
      track={item} 
      onPress={() => {
        playTrack(item);
        navigation.navigate('Player');
      }}
    />
  );

  return (
    <View style={styles.container}>
      {/* FR-1.3: Search Bar */}
      <Searchbar
        placeholder="Tìm kiếm bài hát, ca sĩ..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      {/* FR-8.2: Trending Section */}
      <Text style={styles.sectionTitle}>🎯 Trending</Text>
      <FlatList
        data={trending}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.trendingList}
      />

      {/* FR-1.1: Danh sách nhạc */}
      <Text style={styles.sectionTitle}>📱 Gợi ý cho bạn</Text>
      <FlatList
        data={tracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.trackList}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTracks} />
        }
      />

      {/* FR-4.2: Mini Player */}
      <MiniPlayer navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  trendingList: {
    marginLeft: 16,
    paddingRight: 16,
  },
  trackList: {
    paddingBottom: 120, // Để mini player
  },
});