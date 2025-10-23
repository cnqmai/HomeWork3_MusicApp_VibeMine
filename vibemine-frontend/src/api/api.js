import axios from 'axios';

// Đảm bảo IP này chính xác và backend đang chạy
const API_BASE_URL = 'http://192.168.100.190:8080/api/v1'; 
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Hàm trợ giúp xử lý lỗi
const handleApiError = (error) => {
    if (error.response) {
      console.error("API Error Response:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("API Error Request (No Response):", error.request);
    } else {
      console.error('API Error Message:', error.message);
    }
    throw error; // Ném lỗi ra ngoài để component có thể bắt
};

const api = {
  // FR-1: QUẢN LÝ NHẠC
  // Sửa: Mặc định lấy 50 bài
  getTracks: (page = 0, size = 50) => axiosInstance.get('/tracks', { params: { page, size } }).catch(handleApiError),
  getTrackDetail: (id) => axiosInstance.get(`/tracks/${id}`).catch(handleApiError),
  searchTracks: (query, page = 0, size = 50) => 
    axiosInstance.get('/tracks/search', { params: { q: query, page, size } }).catch(handleApiError),

  // --- CẬP NHẬT (FR-2.1 & 8.3) ---
  // Đổi: playTrack(id) -> playTrack(userId, trackId)
  playTrack: (userId = 1, trackId) => axiosInstance.post(`/users/${userId}/play/${trackId}`).catch(handleApiError),
  // --- KẾT THÚC CẬP NHẬT ---
  
  nextTrack: (id) => axiosInstance.get(`/tracks/next/${id}`).catch(handleApiError),
  prevTrack: (id) => axiosInstance.get(`/tracks/prev/${id}`).catch(handleApiError),

  // FR-3: PLAYLIST & FAVORITES
  getUserFavorites: (userId = 1) => axiosInstance.get(`/users/${userId}/favorites`).catch(handleApiError),
  addToFavorites: (userId = 1, trackId) => axiosInstance.post(`/users/${userId}/favorites/${trackId}`).catch(handleApiError),
  removeFromFavorites: (userId = 1, trackId) => axiosInstance.delete(`/users/${userId}/favorites/${trackId}`).catch(handleApiError),
  
  getUserPlaylists: (userId = 1) => axiosInstance.get(`/users/${userId}/playlists`).catch(handleApiError),
  createPlaylist: (userId = 1, name) => axiosInstance.post(`/users/${userId}/playlists`, { name }).catch(handleApiError),
  addToPlaylist: (playlistId, trackId) => axiosInstance.post(`/playlists/${playlistId}/tracks/${trackId}`).catch(handleApiError),
  getPlaylistDetail: (playlistId) => axiosInstance.get(`/playlists/${playlistId}`).catch(handleApiError),

  // FR-6.4: NÂNG CAO
  // Sửa: Dùng endpoint /api/v1/tracks/genre/{genre}
  getTracksByGenre: (genre) => axiosInstance.get(`/tracks/genre/${genre}`, { params: { page: 0, size: 50 } }).catch(handleApiError), 
  getAlbumTracks: (albumId) => axiosInstance.get(`/albums/${albumId}/tracks`).catch(handleApiError),
  getArtistTracks: (artistId) => axiosInstance.get(`/artists/${artistId}/tracks`).catch(handleApiError),
  getAlbums: (page = 0, size = 10) => axiosInstance.get('/albums', { params: { page, size } }).catch(handleApiError),
  getArtists: (page = 0, size = 10) => axiosInstance.get('/artists', { params: { page, size } }).catch(handleApiError),

  // FR-8: TRENDING & RECOMMENDATIONS
  getTrending: (limit = 10) => axiosInstance.get('/tracks/trending', { params: { limit } }).catch(handleApiError),
  getRecommendations: (userId = 1) => axiosInstance.get(`/users/${userId}/recommendations`).catch(handleApiError),
  getHistory: (userId = 1, limit = 50) => axiosInstance.get(`/users/${userId}/history`, { params: { limit } }).catch(handleApiError),

  // FR-6.2 & FR-9.1
  downloadTrack: (userId = 1, trackId) => axiosInstance.post(`/tracks/users/${userId}/offline/${trackId}`).catch(handleApiError),
  getShareLink: (trackId) => axiosInstance.get(`/tracks/${trackId}/share`).catch(handleApiError),
};

export default api;