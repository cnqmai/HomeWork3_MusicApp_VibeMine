import React, { useEffect, useCallback, useState, useContext } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image,
    TouchableOpacity,
    Alert, 
    ActivityIndicator, 
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider'; 
import { PlayerContext } from '../context/PlayerContext'; // Import PlayerContext
import { SafeAreaView } from "react-native-safe-area-context";

// --- Hardcode màu sắc nếu chưa có file constants ---
const BRAND_COLORS = {
    PRIMARY_GREEN: "#bde1a0",
    BACKGROUND: "#FFFFFF",
    TEXT_DARK: "#333333",
    TEXT_LIGHT: "#666666",
    CONTROL_BG: '#E8F6F1',
};

// Hàm chuyển đổi mili giây sang định dạng MM:SS
const formatTime = (milliseconds) => {
    if (isNaN(milliseconds) || milliseconds <= 0) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};


export default function PlayerScreen({ route, navigation }) {
    const { 
        currentTrack, 
        isPlaying, 
        onPlayPausePress, 
        sound, // Lấy sound object từ context
        status, // Lấy status từ context
        playTrack, // Lấy hàm playTrack để load lại
    } = useContext(PlayerContext);
    
    // State cục bộ của màn hình
    const [isSliderSeeking, setIsSliderSeeking] = useState(false); 
    const [isShuffle, setIsShuffle] = useState(true); 
    const [repeatMode, setRepeatMode] = useState(1); 

    // Thoát sớm nếu không có bài hát
    if (!currentTrack) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, { justifyContent: 'center' }]}>
                    <Text style={{ color: BRAND_COLORS.TEXT_DARK, fontSize: 18 }}>
                        Không có bài hát nào đang phát.
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
                        <Text style={{color: BRAND_COLORS.PRIMARY_GREEN, fontSize: 16}}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    
    const ARTIST_NAME = currentTrack.artists.map(a => a.name).join(", ");
    
    const isLoaded = status?.isLoaded ?? false;
    const safeStatus = status || {}; 

    const positionMillis = isLoaded ? safeStatus.positionMillis ?? 0 : 0;
    const durationMillis = isLoaded ? safeStatus.durationMillis ?? 0 : 0;

    const togglePlayback = async () => {
        if (!sound || !isLoaded) return;
        onPlayPausePress(); // Gọi hàm từ context
    };
    
    const handleSlidingStart = () => setIsSliderSeeking(true);
    
    const handleSlidingComplete = async (value) => {
        if (!sound || !isLoaded) return;
        setIsSliderSeeking(false);
        await sound.setPositionAsync(value);
        if (!isPlaying) {
             await sound.playAsync();
        }
    };
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={headerStyles.container}>
                    <TouchableOpacity onPress={() => navigation.goBack()}> 
                        <Ionicons name="chevron-back" size={30} color={BRAND_COLORS.PRIMARY_GREEN} />
                    </TouchableOpacity>
                    <Text style={headerStyles.title}>Now Playing</Text>
                    <View style={{ width: 20 }} /> 
                </View>

                <View style={styles.coverContainer}>
                    <Image 
                        source={{ uri: currentTrack.coverArtUrl }} 
                        style={styles.coverImage} 
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{currentTrack.title}</Text> 
                    <Text style={styles.trackArtist}>{ARTIST_NAME}</Text> 
                    <Text style={styles.trackAlbum}>{currentTrack.album ? currentTrack.album.title : 'Single'}</Text> 
                </View>
                
                <View style={styles.progressContainer}>
                    <Text style={styles.timeText}>{formatTime(positionMillis)}</Text> 
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={durationMillis > 0 ? durationMillis : 1} 
                        value={positionMillis} 
                        minimumTrackTintColor={BRAND_COLORS.PRIMARY_GREEN} 
                        maximumTrackTintColor={BRAND_COLORS.TEXT_LIGHT}
                        thumbTintColor={BRAND_COLORS.PRIMARY_GREEN}
                        onSlidingStart={handleSlidingStart}
                        onSlidingComplete={handleSlidingComplete}
                    />
                    <Text style={styles.timeText}>{formatTime(durationMillis)}</Text> 
                </View>

                <View style={mainControlStyles.container}>
                    <TouchableOpacity style={mainControlStyles.button} onPress={() => alert('Chức năng chưa được phát triển')}> 
                        <Ionicons name="play-skip-back" size={35} color={BRAND_COLORS.PRIMARY_GREEN} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={mainControlStyles.playPauseButton}
                        onPress={togglePlayback}
                        disabled={!isLoaded}
                    >
                        <Ionicons 
                            name={isPlaying ? "pause" : "play"} 
                            size={40} 
                            color={BRAND_COLORS.PRIMARY_GREEN} 
                            style={mainControlStyles.playPauseIcon}
                        />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={mainControlStyles.button} onPress={() => alert('Chức năng chưa được phát triển')}>
                        <Ionicons name="play-skip-forward" size={35} color={BRAND_COLORS.PRIMARY_GREEN} />
                    </TouchableOpacity>
                </View>
                
                <View style={secondaryControlStyles.container}>
                    <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
                        <MaterialCommunityIcons 
                            name="shuffle" 
                            size={30} 
                            color={isShuffle ? BRAND_COLORS.PRIMARY_GREEN : BRAND_COLORS.TEXT_LIGHT}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setRepeatMode(prev => (prev + 1) % 3)} style={secondaryControlStyles.repeatButton}>
                        <MaterialCommunityIcons 
                            name={repeatMode === 2 ? "repeat-once" : "repeat"} 
                            size={30} 
                            color={repeatMode !== 0 ? BRAND_COLORS.PRIMARY_GREEN : BRAND_COLORS.TEXT_LIGHT}
                        />
                        {repeatMode === 1 && <View style={secondaryControlStyles.repeatDot} />}
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.lyricsButton}>
                    <Text style={styles.lyricsText}>Lyrics</Text>
                    <Ionicons name="chevron-down" size={18} color={BRAND_COLORS.TEXT_LIGHT} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Styles giữ nguyên như file .tsx
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: BRAND_COLORS.BACKGROUND },
    container: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
    coverContainer: { width: '90%', aspectRatio: 1, paddingBottom: 20, paddingTop: 5 },
    coverImage: { width: '100%', height: '100%', borderRadius: 20 },
    trackInfo: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
    trackTitle: { fontSize: 24, fontWeight: 'bold', color: BRAND_COLORS.TEXT_DARK, marginBottom: 4 },
    trackArtist: { fontSize: 16, color: BRAND_COLORS.TEXT_DARK, marginBottom: 4 },
    trackAlbum: { fontSize: 14, color: BRAND_COLORS.TEXT_LIGHT },
    progressContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 5, marginBottom: 20 },
    timeText: { fontSize: 12, color: BRAND_COLORS.TEXT_LIGHT, width: 35, textAlign: 'center' },
    slider: { flex: 1, height: 40, marginHorizontal: 10 },
    lyricsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND_COLORS.CONTROL_BG, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, marginTop: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    lyricsText: { fontSize: 16, fontWeight: '600', color: BRAND_COLORS.TEXT_DARK, marginRight: 5 }
});
const headerStyles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 15 },
    title: { fontSize: 18, fontWeight: 'bold', color: BRAND_COLORS.PRIMARY_GREEN },
});
const mainControlStyles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 30 },
    button: { padding: 20 },
    playPauseButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: BRAND_COLORS.CONTROL_BG, justifyContent: 'center', alignItems: 'center', marginHorizontal: 25, borderWidth: 2, borderColor: BRAND_COLORS.PRIMARY_GREEN, },
    playPauseIcon: { marginLeft: 4 },
});
const secondaryControlStyles = StyleSheet.create({
    container: { flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', },
    repeatButton: { paddingHorizontal: 5, position: 'relative', marginLeft: 30 },
    repeatDot: { position: 'absolute', top: 14, right: 17, width: 5, height: 5, borderRadius: 2.5, backgroundColor: BRAND_COLORS.PRIMARY_GREEN }
});