// src/components/HistoryItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Hàm format thời gian (ví dụ: "2 phút trước", "hôm qua", "20/10/2025")
const formatTimeAgo = (isoDateTime) => {
    try {
        const date = new Date(isoDateTime);
        if (isNaN(date.getTime())) { // Kiểm tra ngày không hợp lệ
             return isoDateTime;
        }
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000; // Năm
        if (interval > 1) return `${Math.floor(interval)} năm trước`;
        interval = seconds / 2592000; // Tháng
        if (interval > 1) return `${Math.floor(interval)} tháng trước`;
        interval = seconds / 86400; // Ngày
        if (interval > 7) return date.toLocaleDateString('vi-VN'); // Hiển thị ngày nếu hơn 1 tuần
        if (interval > 1) return `${Math.floor(interval)} ngày trước`;
        interval = seconds / 3600; // Giờ
        if (interval > 1) return `${Math.floor(interval)} giờ trước`;
        interval = seconds / 60; // Phút
        if (interval > 1) return `${Math.floor(interval)} phút trước`;
        return "Vừa xong";
    } catch (e) {
        console.error("Error formatting time ago:", e);
        return isoDateTime ? isoDateTime.split('T')[0] : ''; // Trả về phần ngày nếu lỗi
    }
};

const HistoryItem = ({ item, onPress }) => {
    if (!item || !item.trackId) return null; // Kiểm tra item hợp lệ

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.iconContainer}>
                 <Ionicons name="time-outline" size={24} color="#888" />
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title || "Unknown Title"}</Text>
                <Text style={styles.artist} numberOfLines={1}>{item.artist || "Unknown Artist"}</Text>
            </View>
             <Text style={styles.timeAgo}>{formatTimeAgo(item.playedAt)}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    iconContainer: {
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    artist: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    timeAgo: {
        fontSize: 12,
        color: '#999',
    },
});

export default React.memo(HistoryItem); // Tối ưu hóa render