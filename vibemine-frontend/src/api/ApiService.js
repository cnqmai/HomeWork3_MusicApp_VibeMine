import axios from 'axios';

// !! QUAN TRỌNG: Thay thế địa chỉ IP này bằng địa chỉ IP của máy tính đang chạy backend.
// Ví dụ: 'http://192.168.1.10:8080'
// Để tìm IP, mở Command Prompt/Terminal và gõ "ipconfig" (Windows) hoặc "ifconfig" (macOS).
const API_URL = 'http://YOUR_COMPUTER_IP_ADDRESS:8080'; 

const ApiService = {
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