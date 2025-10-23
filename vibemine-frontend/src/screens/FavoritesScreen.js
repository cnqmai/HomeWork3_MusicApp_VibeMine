import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import TrackItem from '../components/TrackItem';
import api from '../api/api';
import { useMusicPlayer } from '../hooks/useMusicPlayer';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playTrack } = useMusicPlayer();
  const userId = 1;

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getUserFavorites(userId);
      setFavorites(data);
    } catch (error) {
      console.error('Load favorites error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const renderTrack = ({ item }) => (
    <TrackItem 
      track={item} 
      onPress={() => playTrack(item)}
      isFavorite={true}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💖 Bài hát yêu thích</Text>
      <FlatList
        data={favorites}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadFavorites} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    color: '#333',
  },
  list: {
    paddingBottom: 100,
  },
});