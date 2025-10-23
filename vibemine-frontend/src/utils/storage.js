import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa các key lưu trữ
const FAVORITES_KEY = '@vibemine_favorites';
const PLAYLISTS_KEY = '@vibemine_playlists';

export const storage = {
  // --- Favorites ---
  saveFavorites: async (favorites) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites || [])); // Đảm bảo lưu mảng rỗng nếu không có dữ liệu
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  },
  getFavorites: async () => {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : []; // Trả về mảng rỗng nếu không có dữ liệu
    } catch (e) {
      console.error('Error getting favorites:', e);
      return []; // Trả về mảng rỗng nếu lỗi
    }
  },
  // Thêm hàm để thêm/xóa từng track khỏi favorites (tùy chọn, để quản lý dễ hơn)
  addFavoriteTrack: async (track) => {
    const favorites = await storage.getFavorites();
    if (!favorites.find(fav => fav.id === track.id)) {
      favorites.push(track);
      await storage.saveFavorites(favorites);
    }
  },
  removeFavoriteTrack: async (trackId) => {
    let favorites = await storage.getFavorites();
    favorites = favorites.filter(fav => fav.id !== trackId);
    await storage.saveFavorites(favorites);
  },

  // --- Playlists ---
  savePlaylists: async (playlists) => {
    try {
      await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists || []));
    } catch (e) {
      console.error('Error saving playlists:', e);
    }
  },
  getPlaylists: async () => {
    try {
      const data = await AsyncStorage.getItem(PLAYLISTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error getting playlists:', e);
      return [];
    }
  },
  // Có thể thêm các hàm add/remove playlist, add/remove track to playlist tương tự favorites nếu cần quản lý chi tiết hơn ở storage
};

export default storage; // Export default nếu bạn thích dùng import storage from './storage'