import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    ScrollView,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
// Giả sử bạn đã tạo file colors.js
// import BRAND_COLORS from "../constants/colors"; 
// import CustomHeader from '@/src/components/CustomHeader';

// --- Hardcode màu sắc nếu chưa có file constants ---
const BRAND_COLORS = {
    PRIMARY_GREEN: "#bde1a0",
    BACKGROUND: "#FFFFFF",
    CARD_BG: "#FFFFFF",
    TEXT_DARK: "#333333",
    TEXT_LIGHT: "#666666",
    CREATE_CARD_BG: '#F0FFF7',
    CREATE_BUTTON_BG: '#9BE4C2',
    CONTROL_BG: '#E8F6F1',
};

const { width } = Dimensions.get('window');
const CARD_MARGIN = 15;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - (CARD_MARGIN * (NUM_COLUMNS + 3))) / NUM_COLUMNS;

// --- Dữ liệu Giả định ---
const PLAYLISTS_DATA = [
    { id: 'p1', title: 'Morning Chill Vibes', songs: 15, cover: {uri: 'https://i.scdn.co/image/ab67616d0000b27343e7171e1a539199d75b31e9'}, iconColor: '#9BE4C2' },
    { id: 'p2', title: 'Workout Power', songs: 22, cover: {uri: 'https://i.scdn.co/image/ab67616d0000b273e8e244b7f32f22384a3290b0'}, iconColor: '#E67E22' },
    { id: 'p3', title: 'Evening Jazz Lounge', songs: 10, cover: {uri: 'https://i.scdn.co/image/ab67616d0000b273b88b7d620573e352c3c12658'}, iconColor: '#9B59B6' },
    { id: 'p4', title: 'Road Trip Essentials', songs: 30, cover: {uri: 'https://i.scdn.co/image/ab67616d0000b2733d027f673895e69121a8dd1a'}, iconColor: '#3498DB' },
];

const CreatePlaylistCard = () => (
    <View style={createCardStyles.container}>
        <Ionicons name="add-circle-outline" size={35} color={BRAND_COLORS.PRIMARY_GREEN} />
        <Text style={createCardStyles.title}>Create New Playlist</Text>
        <Text style={createCardStyles.subtitle}>
            Organize your music and craft the perfect listening experience.
        </Text>
        <TouchableOpacity style={createCardStyles.button} onPress={() => console.log('Tạo Playlist mới')}>
            <Text style={createCardStyles.buttonText}>Get Started</Text>
        </TouchableOpacity>
    </View>
);

const PlaylistItem = ({ item }) => (
    <TouchableOpacity style={playlistItemStyles.card}>
        <Image source={item.cover} style={playlistItemStyles.cover} />
        <View style={playlistItemStyles.overlay}>
             <FontAwesome5 name="music" size={12} color={BRAND_COLORS.CARD_BG} style={{ marginRight: 5 }} />
            <Text style={playlistItemStyles.title} numberOfLines={2}>{item.title}</Text>
        </View>
        <Text style={playlistItemStyles.subtitle}>{item.songs} songs</Text>
    </TouchableOpacity>
);

export default function PlaylistsScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.scrollViewContent} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentPadding}>
                    {/* <CustomHeader /> */}
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={BRAND_COLORS.TEXT_LIGHT} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search playlists..."
                            placeholderTextColor={BRAND_COLORS.TEXT_LIGHT}
                        />
                    </View>
                </View>

                <View style={styles.contentPadding}>
                    <CreatePlaylistCard />
                </View>

                <Text style={[styles.sectionTitle, styles.contentPadding]}>Your Playlists</Text>
                
                <FlatList
                    data={PLAYLISTS_DATA}
                    renderItem={({ item }) => <PlaylistItem item={item} />} 
                    keyExtractor={item => item.id}
                    numColumns={NUM_COLUMNS}
                    scrollEnabled={false}
                    columnWrapperStyle={playlistItemStyles.columnWrapper}
                    contentContainerStyle={playlistItemStyles.gridContainer}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: BRAND_COLORS.BACKGROUND,
    },
    container: {
      flex: 1,
    },
    scrollViewContent: {
      paddingBottom: 40,
    },
    contentPadding: {
        paddingHorizontal: 20,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: BRAND_COLORS.CARD_BG,
      borderRadius: 15,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginVertical: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: BRAND_COLORS.TEXT_DARK,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: BRAND_COLORS.TEXT_DARK,
      marginTop: 30,
      marginBottom: 15,
      paddingHorizontal: 5,
    },
});

const createCardStyles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: BRAND_COLORS.CREATE_CARD_BG,
      borderRadius: 15,
      padding: 25,
      borderWidth: 1,
      borderColor: BRAND_COLORS.PRIMARY_GREEN,
      borderStyle: 'dashed',
      marginHorizontal: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: BRAND_COLORS.TEXT_DARK,
      marginTop: 10,
    },
    subtitle: {
      fontSize: 14,
      color: BRAND_COLORS.TEXT_LIGHT,
      textAlign: 'center',
      marginVertical: 10,
    },
    button: {
      backgroundColor: BRAND_COLORS.CREATE_BUTTON_BG,
      borderRadius: 25,
      paddingHorizontal: 30,
      paddingVertical: 12,
      marginTop: 10,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: BRAND_COLORS.TEXT_DARK,
    }
});

const playlistItemStyles = StyleSheet.create({
    gridContainer: {
      paddingHorizontal: 20, 
      paddingTop: 0,
    },
    columnWrapper: {
      justifyContent: 'space-between',
      marginBottom: CARD_MARGIN,
    },
    card: {
      width: CARD_WIDTH,
      backgroundColor: BRAND_COLORS.CARD_BG,
      borderRadius: 15,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: BRAND_COLORS.CONTROL_BG,  
    },
    cover: {
      width: '100%',
      height: CARD_WIDTH,
      borderRadius: 15,
    },
    overlay: {
      position: 'absolute',
      top: 10,
      left: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: BRAND_COLORS.CARD_BG,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    subtitle: {
      fontSize: 14,
      color: BRAND_COLORS.TEXT_LIGHT,
      paddingLeft: 10,
      paddingVertical: 12,
    }
});