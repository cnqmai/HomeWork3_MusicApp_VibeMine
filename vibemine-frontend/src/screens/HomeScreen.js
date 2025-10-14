import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput,
    Image, FlatList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../api/ApiService';
import { PlayerContext } from '../context/PlayerContext';

// --- Placeholder Data for UI (chỉ giữ lại Genres) ---
const genresData = [
    { id: '1', name: 'Pop Hits', color: '#8A2BE2' },
    { id: '2', name: 'Rock Anthems', color: '#DC143C' },
    { id: '3', name: 'Hip Hop Beats', color: '#2E8B57' },
    { id: '4', name: 'Electronic Vibes', color: '#1E90FF' },
];

// --- Functional Components for Sections ---
const SectionHeader = ({ title }) => <Text style={styles.sectionTitle}>{title}</Text>;

const RecommendationItem = ({ track, onPress }) => {
    const artists = track.artists.map(artist => artist.name).join(', ');
    return (
        <TouchableOpacity style={styles.recommendationItem} onPress={onPress}>
            <Image source={{ uri: track.coverArtUrl }} style={styles.recommendationImage} />
            <View style={styles.recommendationText}>
                <Text style={styles.recommendationTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.recommendationArtist} numberOfLines={1}>{artists}</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color="#888" />
        </TouchableOpacity>
    );
};

export default function HomeScreen({ navigation }) {
    const [recommendations, setRecommendations] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack } = useContext(PlayerContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi tất cả API cùng lúc để tăng tốc độ tải
                const [tracksRes, albumsRes, artistsRes] = await Promise.all([
                    ApiService.getAllTracks(),
                    ApiService.getAllAlbums(),
                    ApiService.getAllArtists(),
                ]);
                setRecommendations(tracksRes.data);
                setAlbums(albumsRes.data);
                setArtists(artistsRes.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu cho Home Screen:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTrackPress = (track) => {
        playTrack(track);
        navigation.navigate('Player');
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#66DDAA" /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.appName}>VibeMine</Text>
                    <View style={styles.headerIcons}>
                        <Ionicons name="notifications-outline" size={24} color="black" />
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
                            style={styles.avatar}
                        />
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput placeholder="Search songs or artists..." style={styles.searchBar} />
                </View>

                {/* Trending Music - Tạm thời vẫn dùng recommendtions */}
                <SectionHeader title="Trending Music" />
                <FlatList
                    horizontal
                    data={recommendations.filter(t => t.isTrending).slice(0, 4)} // Lấy 4 bài trending
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.trendingCard} onPress={() => handleTrackPress(item)}>
                            <Image source={{ uri: item.coverArtUrl }} style={styles.trendingImage} />
                            <Text style={styles.trendingTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.trendingArtist} numberOfLines={1}>{item.artists.map(a => a.name).join(', ')}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 15 }}
                />

                {/* Your Recommendations Section */}
                <SectionHeader title="Your Recommendations" />
                {recommendations.slice(0, 5).map(item => (
                    <RecommendationItem key={item.id} track={item} onPress={() => handleTrackPress(item)} />
                ))}

                {/* Browse Albums Section - Dùng dữ liệu thật */}
                <SectionHeader title="Browse Albums" />
                 <FlatList
                    horizontal
                    data={albums}
                    renderItem={({ item }) => (
                         <TouchableOpacity style={styles.albumCard}>
                            <Image source={{ uri: item.coverArtUrl }} style={styles.albumImage} />
                            <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 15 }}
                />
                
                {/* Top Artists Section - Dùng dữ liệu thật */}
                <SectionHeader title="Top Artists" />
                <FlatList
                    horizontal
                    data={artists}
                    renderItem={({ item }) => (
                         <TouchableOpacity style={styles.artistCircle}>
                            <Image source={{ uri: item.avatarUrl }} style={styles.artistImage} />
                            <Text style={styles.artistName}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 15 }}
                />
                
                {/* Explore Genres Section */}
                <SectionHeader title="Explore Genres" />
                <View style={styles.genreContainer}>
                    {genresData.map(item => (
                        <TouchableOpacity key={item.id} style={[styles.genreCard, { backgroundColor: item.color }]}>
                            <Text style={styles.genreText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    appName: { fontSize: 24, fontWeight: 'bold' },
    headerIcons: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 30, height: 30, borderRadius: 15, marginLeft: 15 },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 15,
        paddingHorizontal: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchIcon: { marginRight: 10 },
    searchBar: { flex: 1, height: 40, fontSize: 16 },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
        marginTop: 15,
        marginBottom: 10,
    },
    trendingCard: { marginRight: 15, width: 150 },
    trendingImage: { width: 150, height: 150, borderRadius: 10 },
    trendingTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 5 },
    trendingArtist: { fontSize: 14, color: '#666' },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    recommendationImage: { width: 50, height: 50, borderRadius: 5 },
    recommendationText: { flex: 1, marginLeft: 10 },
    recommendationTitle: { fontSize: 16, fontWeight: '500' },
    recommendationArtist: { fontSize: 14, color: '#888' },
    albumCard: { marginRight: 15, width: 160 },
    albumImage: { width: 160, height: 160, borderRadius: 10 },
    albumTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 5 },
    artistCircle: { alignItems: 'center', marginRight: 20 },
    artistImage: { width: 80, height: 80, borderRadius: 40 },
    artistName: { marginTop: 5, fontSize: 14 },
    genreContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    genreCard: {
        width: '48%',
        height: 80,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    genreText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});