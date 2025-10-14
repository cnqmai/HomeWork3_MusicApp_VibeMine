import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { PlayerContext } from '../context/PlayerContext';
// Bạn sẽ cần cài đặt thư viện icon, ví dụ: @expo/vector-icons
// import { Ionicons } from '@expo/vector-icons'; 

export default function PlayerScreen({ navigation }) {
    const { currentTrack, isPlaying, onPlayPausePress } = useContext(PlayerContext);

    if (!currentTrack) {
        // Nếu không có bài hát nào được chọn, hiển thị thông báo
        return (
            <SafeAreaView style={styles.container}>
                <Text>Chưa có bài hát nào được chọn.</Text>
            </SafeAreaView>
        );
    }
    
    // Lấy tên các nghệ sĩ
    const artists = currentTrack.artists.map(artist => artist.name).join(', ');

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                {/* Thay thế bằng Icon */}
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Image source={{ uri: currentTrack.coverArtUrl }} style={styles.coverImage} />
            
            <Text style={styles.title}>{currentTrack.title}</Text>
            <Text style={styles.artist}>{artists}</Text>
            
            {/* Thanh tiến trình sẽ được thêm sau */}
            
            <View style={styles.controlsContainer}>
                {/* Nút Previous */}
                <TouchableOpacity>
                    <Text style={styles.controlText}>PREV</Text>
                </TouchableOpacity>
                
                {/* Nút Play/Pause */}
                <TouchableOpacity style={styles.playButton} onPress={onPlayPausePress}>
                    <Text style={styles.playButtonText}>{isPlaying ? 'PAUSE' : 'PLAY'}</Text>
                </TouchableOpacity>

                {/* Nút Next */}
                <TouchableOpacity>
                    <Text style={styles.controlText}>NEXT</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
    },
    backButtonText: {
        fontSize: 18,
        color: '#66DDAA',
    },
    coverImage: {
        width: '80%',
        aspectRatio: 1, // Để ảnh vuông
        borderRadius: 20,
        marginTop: 100,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    artist: {
        fontSize: 18,
        color: '#888',
        marginTop: 5,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '70%',
        marginTop: 50,
    },
    playButton: {
        width: 70,
        height: 70,
        backgroundColor: '#66DDAA',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    controlText: {
        fontSize: 18,
        fontWeight: 'bold'
    }
});