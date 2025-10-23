import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    Image, FlatList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../api/ApiService';
import { PlayerContext } from '../context/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { SafeAreaView } from "react-native-safe-area-context";
import debounce from 'lodash.debounce'; // Import debounce

// --- Dữ liệu giả cho các mục chưa có API ---
const GENRE_CATEGORIES = [
    { id: '1', name: 'Pop Hits', colors: ['#8A2BE2', '#4B0082'] },
    { id: '2', name: 'Rock Anthems', colors: ['#DC143C', '#8B0000'] },
    { id: '3', name: 'Hip Hop Beats', colors: ['#2E8B57', '#006400'] },
    { id: '4', name: 'Electronic', colors: ['#1E90FF', '#00008B'] },
];

// --- Component con ---
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
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack } = useContext(PlayerContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]); // State mới cho kết quả tìm kiếm
    const [isSearching, setIsSearching] = useState(false); // State để biết đang tìm kiếm hay không


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tracksRes, albumsRes, artistsRes] = await Promise.all([
                    ApiService.getAllTracks(),
                    ApiService.getAllAlbums(),
                    ApiService.getAllArtists(),
                ]);
                setTracks(tracksRes.data);
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

    // Hàm xử lý tìm kiếm
    const handleSearch = async (query) => {
        if (query.trim() === '') {
            setSearchResults([]); // Xóa kết quả nếu query rỗng
            setIsSearching(false);
            return;
        }
        setIsSearching(true); // Đánh dấu đang tìm kiếm
        try {
            console.log(`Searching for: ${query}`); // Log tìm kiếm
            const response = await ApiService.searchTracks(query);
            console.log('Search results:', response.data); // Log kết quả
            setSearchResults(response.data);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm bài hát:", error);
            setSearchResults([]); // Xóa kết quả nếu có lỗi
        }
    };

    // Sử dụng debounce để tránh gọi API liên tục khi gõ
    const debouncedSearch = useCallback(debounce(handleSearch, 500), []); // Đợi 500ms sau khi ngừng gõ

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        debouncedSearch(text);
    };


    const handleTrackPress = (track) => {
        playTrack(track);
        navigation.navigate('Player');
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#66DDAA" /></View>;
    }

    // Quyết định danh sách nào sẽ hiển thị (kết quả tìm kiếm hoặc danh sách mặc định)
    // const displayTracks = isSearching ? searchResults : tracks; // Không cần dòng này nữa

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
                    <TextInput
                        placeholder="Search songs or artists..."
                        style={styles.searchBar}
                        value={searchQuery}
                        onChangeText={handleSearchChange} // Gọi hàm khi thay đổi text
                    />
                    {searchQuery.length > 0 && ( // Nút xóa tìm kiếm
                        <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(''); }}>
                            <Ionicons name="close-circle" size={20} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>

                 {/* Hiển thị kết quả tìm kiếm hoặc nội dung mặc định */}
                 {isSearching ? (
                        <>
                            <SectionHeader title={`Search Results for "${searchQuery}"`} />
                            {searchResults.length > 0 ? (
                                searchResults.map(item => (
                                    <RecommendationItem key={item.id} track={item} onPress={() => handleTrackPress(item)} />
                                ))
                            ) : (
                                <Text style={styles.noResultsText}>No tracks found.</Text>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Trending Music */}
                            <SectionHeader title="Trending Music" />
                            <FlatList
                                horizontal
                                data={tracks.filter(t => t.isTrending).slice(0, 5)} // Vẫn dùng tracks gốc cho trending
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

                            {/* Your Recommendations */}
                            <SectionHeader title="Your Recommendations" />
                            {tracks.slice(0, 4).map(item => ( // Vẫn dùng tracks gốc
                                <RecommendationItem key={item.id} track={item} onPress={() => handleTrackPress(item)} />
                            ))}

                            {/* Browse Albums */}
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

                            {/* Top Artists */}
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
                                contentContainerStyle={{ paddingLeft: 15, paddingVertical: 10 }}
                            />

                            {/* Explore Genres */}
                            <SectionHeader title="Explore Genres" />
                            <View style={styles.genreContainer}>
                                {GENRE_CATEGORIES.map(item => (
                                    <TouchableOpacity key={item.id}>
                                        <LinearGradient
                                            colors={item.colors}
                                            style={styles.genreCard}
                                        >
                                            <Text style={styles.genreText}>{item.name}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
            </ScrollView>
        </SafeAreaView>
    );
}

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
        marginTop: 20,
        marginBottom: 15,
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
    albumTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 5, paddingHorizontal: 5 },
    artistCircle: { alignItems: 'center', marginRight: 20 },
    artistImage: { width: 80, height: 80, borderRadius: 40 },
    artistName: { marginTop: 5, fontSize: 14 },
    genreContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    genreCard: {
        // width: '48%', // Sử dụng % để tự động chia 2 cột
        width: 160, // Giữ nguyên nếu bạn muốn kích thước cố định
        height: 80,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    genreText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Style mới
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666', // Màu TEXT_LIGHT
    },
});