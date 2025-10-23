import React, { useState, useEffect, useCallback, memo } from 'react'; // Thêm memo
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator, // Vẫn cần ActivityIndicator (có thể thay bằng Progress.Circle nếu muốn)
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDownloadedTracks, downloadTrack, removeDownloadedTrack } from '../utils/DownloadManager';
import * as Progress from 'react-native-progress'; // Import Progress.Circle

const { width } = Dimensions.get('window');

// Sử dụng React.memo để tối ưu hóa render khi props không đổi
const TrackItem = memo(({ track, onPress, isFavorite = false, onToggleFavorite, onDownloadsChange }) => {
  // 'none', 'queued', 'downloading', 'downloaded', 'error'
  const [downloadState, setDownloadState] = useState('none');
  const [downloadProgress, setDownloadProgress] = useState(0); // Progress từ 0 đến 1
  const [localUri, setLocalUri] = useState(null);

  // --- Effect kiểm tra trạng thái tải ban đầu ---
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      // Reset state trước khi kiểm tra để tránh hiển thị sai nếu track thay đổi
      if (isMounted) {
          setDownloadState('none');
          setLocalUri(null);
          setDownloadProgress(0);
      }

      const downloaded = await getDownloadedTracks();
      // console.log(`Checking download status for ${track.id}:`, downloaded[track.id.toString()]); // Debug log
      if (isMounted && downloaded[track.id.toString()]) {
        setDownloadState('downloaded');
        setLocalUri(downloaded[track.id.toString()]);
      }
    };

    checkStatus();
    return () => { isMounted = false; };
  }, [track.id]); // Chạy lại khi track.id thay đổi

  // --- Callback cập nhật tiến trình ---
  const handleProgress = useCallback((progressPercent) => {
    // console.log(`Progress for ${track.id}: ${progressPercent}%`); // Debug log
    if (progressPercent === -1) { // Kiểm tra tín hiệu lỗi
        setDownloadState('error');
         // Tự động reset về 'none' sau vài giây
        setTimeout(() => {
           setDownloadState(prevState => prevState === 'error' ? 'none' : prevState); // Chỉ reset nếu vẫn đang error
        }, 3000)
    } else if (progressPercent < 100) {
      setDownloadState('downloading'); // Đảm bảo state là downloading khi có progress < 100
      setDownloadProgress(progressPercent / 100);
    } else {
      // Không cần set state downloaded ở đây vì đã xử lý trong handleDownloadPress
    }
  }, [track.id]); // Thêm track.id vào dependencies nếu cần log

  // --- Xử lý nhấn nút Download/Delete ---
  const handleDownloadPress = useCallback(async () => {
    if (downloadState === 'downloaded' && localUri) {
      // Xác nhận xóa
      Alert.alert(
        "Xóa bài hát offline",
        `Bạn có chắc muốn xóa "${track.title}" khỏi thiết bị?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xóa", style: "destructive", onPress: async () => {
              setDownloadState('queued'); // Hiển thị trạng thái đang chờ xóa
              const success = await removeDownloadedTrack(track.id);
              if (success) {
                setDownloadState('none');
                setLocalUri(null);
                if (onDownloadsChange) onDownloadsChange();
              } else {
                 setDownloadState('downloaded'); // Quay lại state cũ nếu xóa lỗi
                 // Alert đã có trong removeDownloadedTrack
              }
            }
          }
        ]
      );
    } else if (downloadState === 'none' || downloadState === 'error') {
      setDownloadState('queued'); // Trạng thái chờ bắt đầu tải
      setDownloadProgress(0);
      const uri = await downloadTrack(track, handleProgress); // Truyền callback progress
      if (uri) {
        setDownloadState('downloaded');
        setLocalUri(uri);
        if (onDownloadsChange) onDownloadsChange();
      } else {
        // State 'error' đã được set trong handleProgress
        // Không cần làm gì thêm ở đây
      }
    }
    // Không làm gì khi đang queued hoặc downloading
  }, [downloadState, localUri, track, handleProgress, onDownloadsChange]);

  // --- Render icon download ---
  const renderDownloadIcon = () => {
    switch (downloadState) {
       case 'queued': // Trạng thái chờ (đang xử lý xóa hoặc chờ tải)
         return <ActivityIndicator size={26} color="#999" />;
      case 'downloading':
        return (
          <Progress.Circle
            size={26}
            progress={downloadProgress}
            indeterminate={downloadProgress <= 0} // Quay tròn khi progress là 0 hoặc chưa bắt đầu
            color="#9C27B0"
            borderWidth={1.5}
            thickness={2}
            showsText={false}
          />
        );
      case 'downloaded':
        return <Ionicons name="checkmark-circle" size={26} color="#4CAF50" />; // Màu xanh lá
      case 'error':
         return <Ionicons name="alert-circle" size={26} color="#F44336" />; // Màu đỏ
      case 'none':
      default:
        return <Ionicons name="cloud-download-outline" size={26} color="#666" />;
    }
  };

  // --- Định dạng Duration ---
  const formatDuration = (milliseconds) => {
    if (isNaN(milliseconds) || milliseconds <= 0) return '--:--'; // Xử lý duration không hợp lệ
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  // --- Render Component ---
  return (
    <TouchableOpacity
        style={styles.container}
        // Truyền cả track và localUri (có thể là null) cho hàm onPress
        onPress={() => onPress(track, localUri)}
        >
      <Image source={{ uri: track.coverArtUrl }} style={styles.coverArt} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.title || "Unknown Title"}</Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artists?.[0]?.name || 'Unknown Artist'}
        </Text>
        <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
      </View>

       {/* Nút yêu thích */}
       {onToggleFavorite && ( // Chỉ hiển thị nếu có prop onToggleFavorite
            <TouchableOpacity onPress={onToggleFavorite} style={styles.iconButton}>
                <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color="#E91E63" // Màu hồng cho nút tim
                />
            </TouchableOpacity>
       )}


      {/* Nút Download/Delete */}
      <TouchableOpacity
        onPress={handleDownloadPress}
        style={styles.iconButton}
        disabled={downloadState === 'downloading' || downloadState === 'queued'} // Disable khi đang xử lý
      >
        {renderDownloadIcon()}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}); // Bọc component với memo

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  coverArt: {
    width: 55,
    height: 55,
    borderRadius: 6,
    backgroundColor: '#eee', // Màu nền placeholder
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 1,
  },
  artist: {
    fontSize: 13,
    color: '#666',
    marginBottom: 1,
  },
  duration: {
    fontSize: 11,
    color: '#999',
  },
   iconButton: {
    padding: 8,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44, // Tăng kích thước tối thiểu để dễ bấm hơn (Accessibility)
    minHeight: 44,
   },
});

export default TrackItem; // Export component đã memoized