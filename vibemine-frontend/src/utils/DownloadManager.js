// src/utils/DownloadManager.js
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const DOWNLOADED_TRACKS_KEY = 'downloadedTracks'; // Key lưu danh sách đã tải
const MUSIC_DIRECTORY = FileSystem.documentDirectory + 'music/'; // Thư mục lưu nhạc

// Đảm bảo thư mục tồn tại
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(MUSIC_DIRECTORY);
  if (!dirInfo.exists) {
    console.log("Music directory doesn't exist, creating...");
    try {
      await FileSystem.makeDirectoryAsync(MUSIC_DIRECTORY, { intermediates: true });
    } catch (error) {
      console.error("Could not create music directory:", error);
      Alert.alert("Lỗi", "Không thể tạo thư mục lưu trữ nhạc offline.");
      return false; // Trả về false nếu không tạo được thư mục
    }
  }
  return true; // Trả về true nếu thư mục tồn tại hoặc tạo thành công
};

// Lấy danh sách các bài hát đã tải (Map: trackId -> localUri)
export const getDownloadedTracks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(DOWNLOADED_TRACKS_KEY);
    const tracks = jsonValue != null ? JSON.parse(jsonValue) : {};
    //console.log("Loaded downloaded tracks:", tracks); // Debug log
    return tracks;
  } catch (e) {
    console.error("Error reading downloaded tracks:", e);
    return {};
  }
};

// Lưu thông tin bài hát đã tải vào AsyncStorage
const saveDownloadedTrackInfo = async (trackId, localUri) => {
  try {
    const currentDownloads = await getDownloadedTracks();
    currentDownloads[trackId.toString()] = localUri; // Đảm bảo key là string
    await AsyncStorage.setItem(DOWNLOADED_TRACKS_KEY, JSON.stringify(currentDownloads));
     console.log(`Saved download info for track ${trackId}: ${localUri}`); // Debug log
  } catch (e) {
    console.error("Error saving downloaded track info:", e);
  }
};

// Xóa thông tin và file của bài hát đã tải
export const removeDownloadedTrack = async (trackId) => {
   try {
    const currentDownloads = await getDownloadedTracks();
    const trackIdStr = trackId.toString(); // Đảm bảo key là string
    const localUri = currentDownloads[trackIdStr];

    if (localUri) {
       console.log(`Attempting to delete file: ${localUri} for track ${trackIdStr}`); // Debug log
      // Kiểm tra file tồn tại trước khi xóa
       const fileInfo = await FileSystem.getInfoAsync(localUri);
       if (fileInfo.exists) {
           await FileSystem.deleteAsync(localUri, { idempotent: true });
           console.log(`Deleted downloaded file: ${localUri}`);
       } else {
            console.log(`File not found, skipping delete: ${localUri}`);
       }


      // Xóa thông tin trong AsyncStorage
      delete currentDownloads[trackIdStr];
      await AsyncStorage.setItem(DOWNLOADED_TRACKS_KEY, JSON.stringify(currentDownloads));
      console.log(`Removed track ${trackIdStr} from downloaded list.`);
      return true; // Xóa thành công
    } else {
        console.log(`Track ${trackIdStr} not found in downloaded list.`);
        return false; // Không tìm thấy để xóa
    }
  } catch (e) {
    console.error("Error removing downloaded track:", e);
    Alert.alert("Lỗi", "Không thể xóa bài hát đã tải.");
    return false; // Xóa thất bại
  }
};


// Hàm tải bài hát
export const downloadTrack = async (track, onProgress) => {
  if (!track || !track.trackUrl || !track.id) {
    console.error("Invalid track data for download:", track);
    Alert.alert("Lỗi", "Thông tin bài hát không hợp lệ để tải.");
    return null; // Trả về null nếu thông tin không hợp lệ
  }

  const dirExists = await ensureDirExists();
   if (!dirExists) return null; // Dừng nếu không tạo được thư mục

  // Tạo tên file an toàn (loại bỏ ký tự không hợp lệ)
  const safeTitle = (track.title || 'unknown').replace(/[^a-zA-Z0-9.-]/g, '_');
  // Lấy phần mở rộng file từ URL (nếu có), mặc định là mp3
  let fileExtension = 'mp3';
   const urlParts = track.trackUrl.split('?')[0].split('.'); // Loại bỏ query params trước khi lấy extension
   if (urlParts.length > 1) {
       const ext = urlParts.pop()?.toLowerCase();
       // Kiểm tra extension hợp lệ (ví dụ: mp3, m4a, wav...)
       if (ext && ['mp3', 'm4a', 'wav', 'aac', 'flac', 'ogg'].includes(ext)) {
           fileExtension = ext;
       }
   }

  const filename = `track_${track.id}_${safeTitle}.${fileExtension}`;
  const localUri = MUSIC_DIRECTORY + filename;

  console.log(`Starting download for track ${track.id} from ${track.trackUrl} to ${localUri}`);

  // Callback cho tiến trình tải
  const downloadProgressCallback = downloadProgress => {
    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    // console.log(`Download Progress ${track.id}: ${progress * 100}%`); // Debug log
    if (onProgress && !isNaN(progress)) { // Kiểm tra progress là số hợp lệ
      onProgress(progress * 100); // Gửi % tiến trình
    }
  };

  // Tạo đối tượng download resumable
  const downloadResumable = FileSystem.createDownloadResumable(
    track.trackUrl,
    localUri,
    {}, // options (có thể thêm headers nếu cần)
    downloadProgressCallback
  );

  try {
    // Bắt đầu tải
    const result = await downloadResumable.downloadAsync();

    // Kiểm tra kết quả sau khi tải xong
    if (result && result.status >= 200 && result.status < 300) { // Check for successful HTTP status
      console.log('Download finished successfully:', result.uri);
      await saveDownloadedTrackInfo(track.id, result.uri);
      if (onProgress) onProgress(100); // Báo hiệu hoàn thành
      return result.uri; // Trả về đường dẫn file local
    } else {
        // Xử lý lỗi tải (HTTP status không thành công)
        console.error("Download failed:", result);
        // Cố gắng xóa file tạm nếu có lỗi
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists) {
             await FileSystem.deleteAsync(localUri, { idempotent: true });
        }
        Alert.alert("Tải thất bại", `Không thể tải bài hát. Server trả về mã: ${result?.status || 'Unknown'}`);
        if (onProgress) onProgress(-1); // Gửi tín hiệu lỗi (-1)
        return null; // Trả về null nếu thất bại
    }
  } catch (e) {
    // Xử lý lỗi trong quá trình download (network error, file system error...)
    console.error("Download error exception:", e);
     // Cố gắng xóa file tạm nếu có lỗi
     const fileInfo = await FileSystem.getInfoAsync(localUri);
     if (fileInfo.exists) {
          await FileSystem.deleteAsync(localUri, { idempotent: true });
     }
    Alert.alert("Lỗi", "Đã xảy ra lỗi trong quá trình tải: " + e.message);
    if (onProgress) onProgress(-1); // Gửi tín hiệu lỗi (-1)
    return null; // Trả về null nếu có lỗi
  }
};