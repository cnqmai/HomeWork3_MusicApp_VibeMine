import axios from 'axios';

const API_BASE_URL = 'http://192.168.100.190:8080/api/v1'; // ✅ IP CỦA BẠN
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const api = {
  // FR-1: QUẢN LÝ NHẠC ✅
  getTracks: (page = 0, size = 20) => axiosInstance.get('/tracks', { params: { page, size } }),
  getTrackDetail: (id) => axiosInstance.get(`/tracks/${id}`),
  searchTracks: (query, page = 0, size = 20) => 
    axiosInstance.get('/tracks/search', { params: { q: query, page, size } }),

  // FR-2: PHÁT NHẠC ✅
  playTrack: (id) => axiosInstance.post(`/tracks/${id}/play`),
  nextTrack: (id) => axiosInstance.get(`/tracks/next/${id}`),
  prevTrack: (id) => axiosInstance.get(`/tracks/prev/${id}`),

  // FR-3: PLAYLIST & FAVORITES ✅
  getUserFavorites: (userId = 1) => axiosInstance.get(`/users/${userId}/favorites`),
  toggleFavorite: (userId = 1, trackId) => axiosInstance.post(`/users/${userId}/favorites/${trackId}`),
  
  getUserPlaylists: (userId = 1) => axiosInstance.get(`/users/${userId}/playlists`),
  createPlaylist: (userId = 1, name) => axiosInstance.post(`/users/${userId}/playlists`, { name }),
  addToPlaylist: (playlistId, trackId) => axiosInstance.post(`/playlists/${playlistId}/tracks/${trackId}`),
  getPlaylistDetail: (playlistId) => axiosInstance.get(`/playlists/${playlistId}`),

  // FR-6.4: NÂNG CAO ✅
  getTracksByGenre: (genre) => axiosInstance.get(`/genres/${genre}/tracks`),
  getAlbumTracks: (albumId) => axiosInstance.get(`/albums/${albumId}/tracks`),
  getArtistTracks: (artistId) => axiosInstance.get(`/artists/${artistId}/tracks`),

  // FR-8: TRENDING & RECOMMENDATIONS ✅
  getTrending: (limit = 10) => axiosInstance.get('/tracks/trending', { params: { limit } }),
  getRecommendations: (userId = 1) => axiosInstance.get(`/users/${userId}/recommendations`),
  getHistory: (userId = 1, limit = 50) => axiosInstance.get(`/users/${userId}/history`, { params: { limit } }),

  // FR-6.2 & FR-9.1 ✅
  downloadTrack: (userId = 1, trackId) => axiosInstance.post(`/tracks/users/${userId}/offline/${trackId}`),
  getShareLink: (trackId) => axiosInstance.get(`/tracks/${trackId}/share`),
};

export default api;