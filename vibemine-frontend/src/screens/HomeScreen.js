import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MusicItem from '../components/MusicItem';
import api from '../services/api';

export default function HomeScreen() {
  const [tracks, setTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchTracks();
    }, [])
  );

  const fetchTracks = async () => {
    try {
      const response = await api.get('/tracks');
      setTracks(response.data);
      setFilteredTracks(response.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      api.get(`/tracks/search?keyword=${query}`)
        .then(response => setFilteredTracks(response.data))
        .catch(error => console.error('Search error:', error));
    } else {
      setFilteredTracks(tracks);
    }
  };

  const handlePlayTrack = (track) => {
    navigation.navigate('Player', { track });
  };

  const renderTrack = ({ item }) => (
    <MusicItem track={item} onPress={() => handlePlayTrack(item)} />
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm bài hát, ca sĩ..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      
      <FlatList
        data={filteredTracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  searchInput: {
    backgroundColor: '#1f1f1f',
    color: 'white',
    padding: 15,
    margin: 20,
    borderRadius: 25,
    fontSize: 16,
  },
});