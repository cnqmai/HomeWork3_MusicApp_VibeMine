import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  saveFavorites: async (favorites) => {
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  },
  getFavorites: async () => {
    const data = await AsyncStorage.getItem('favorites');
    return data ? JSON.parse(data) : [];
  },
  savePlaylists: async (playlists) => {
    await AsyncStorage.setItem('playlists', JSON.stringify(playlists));
  },
};