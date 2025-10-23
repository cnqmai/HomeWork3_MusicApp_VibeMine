import axios from 'axios';

// !! QUAN TRỌNG: Thay thế địa chỉ IP này bằng địa chỉ IP của máy tính đang chạy backend.
// Để tìm IP, mở Command Prompt/Terminal và gõ "ipconfig" (Windows) hoặc "ifconfig" (macOS).
const API_URL = 'http://192.168.100.190:8080';
// 192.168.100.190: Nhà
// 172.20.10.2: 4g su

// Set a sensible default timeout for all requests (ms)
axios.defaults.timeout = 10000; // 10 seconds

const ApiService = {
  // --- HEALTH / DEBUG ---
  ping: () => {
    return axios.get(`${API_URL}/api/auth/ping`);
  },

  // --- AUTH ---
  login: (username, password) => {
    return axios.post(`${API_URL}/api/auth/login`, { username, password });
  },

  register: (username, email, password) => {
    return axios.post(`${API_URL}/api/auth/signup`, { username, email, password });
  },

  // --- TRACKS ---
  getAllTracks: () => {
    return axios.get(`${API_URL}/api/track`);
  },
  // THÊM HÀM NÀY
  searchTracks: (keyword) => {
    return axios.get(`${API_URL}/api/track/search`, { params: { keyword } });
  },

  // --- ALBUMS ---
  getAllAlbums: () => {
    return axios.get(`${API_URL}/api/albums`);
  },

  // --- ARTISTS ---
  getAllArtists: () => {
    return axios.get(`${API_URL}/api/artists`);
  },

  // --- USER SPECIFIC (Cần userId) ---
  getFavorites: (userId) => {
    return axios.get(`${API_URL}/api/user/${userId}/favorites`);
  },

  // Các hàm gọi API khác sẽ được thêm vào đây...
};

export default ApiService;