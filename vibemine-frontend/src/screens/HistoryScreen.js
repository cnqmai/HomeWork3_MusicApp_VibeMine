// src/screens/HistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView, // Thêm ScrollView vào imports
} from 'react-native';
import api from '../api/api';
import { useFocusEffect } from '@react-navigation/native';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import HistoryItem from '../components/HistoryItem'; // Import component mới
import MiniPlayer from '../components/MiniPlayer'; // Import MiniPlayer
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { playTrack, userId } = useMusicPlayer();

  const fetchHistory = useCallback(async (showLoading = true) => {
    if (showLoading && history.length === 0) setLoading(true); // Chỉ loading nếu list rỗng
    else if (!showLoading) setIsRefreshing(true);

    try {
      console.log("HistoryScreen: Fetching history...");
      const { data } = await api.getHistory(userId, 100);
      setHistory(data || []);
    } catch (error) {
      console.error("HistoryScreen: Load history error:", error);
      if (showLoading) Alert.alert("Lỗi", "Không thể tải lịch sử nghe nhạc.");
    } finally {
      if (showLoading) setLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, history.length]); // Thêm history.length

  // Tải dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchHistory(history.length === 0);
    }, [fetchHistory])
  );

  // Xử lý khi nhấn vào một mục lịch sử
  const handleItemPress = useCallback(async (historyItem) => {
      if (!historyItem || !historyItem.trackId) return;

      console.log(`HistoryScreen: Attempting to play track ${historyItem.trackId}`);
       try {
           // Gọi API lấy chi tiết track (vì HistoryDTO không đủ info)
           setLoading(true); // Hiển thị loading tạm thời
           const { data: trackDetail } = await api.getTrackDetail(historyItem.trackId);
           if (trackDetail && trackDetail.track) {
                // Kiểm tra xem bài hát có localUri không
                const downloaded = await getDownloadedTracks();
                const localUri = downloaded[trackDetail.track.id.toString()];
               
                playTrack(trackDetail.track, localUri); // Phát bài hát
                navigation.navigate('Player');
           } else {
               Alert.alert("Lỗi", "Không tìm thấy thông tin bài hát này (có thể đã bị xóa).");
           }
       } catch (e) {
            console.error("Error fetching track detail from history:", e);
           Alert.alert("Lỗi", "Không thể phát bài hát này.");
       } finally {
            setLoading(false);
       }
  }, [playTrack, navigation]); // Thêm dependencies

  // Render Item
  const renderHistoryItem = ({ item }) => (
    <HistoryItem
      item={item}
      onPress={() => handleItemPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Text style={styles.title}>🕘 Lịch sử nghe nhạc</Text>
      
      {/* Hiển thị loading toàn màn hình nếu đang tải lần đầu */}
      {loading && history.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9C27B0" />
        </View>
      ) : history.length === 0 ? ( // Hiển thị list rỗng
        <ScrollView 
            contentContainerStyle={styles.center}
            refreshControl={
                 <RefreshControl refreshing={isRefreshing} onRefresh={fetchHistory} colors={["#9C27B0"]}/>
            }
        >
          <Text style={styles.emptyText}>Bạn chưa nghe bài hát nào.</Text>
        </ScrollView>
      ) : ( // Hiển thị FlatList
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `${item.trackId}-${item.playedAt}-${index}`}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchHistory(false)} colors={["#9C27B0"]} />
          }
        />
      )}
      
      {/* MiniPlayer nằm trên cùng */}
      <MiniPlayer navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50, // Đẩy lên trên MiniPlayer
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 40,
    color: '#333',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // Xóa paddingTop vì đã có SafeAreaView
  },
  list: {
    paddingBottom: 120, // Tăng padding bottom cho MiniPlayer
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
});