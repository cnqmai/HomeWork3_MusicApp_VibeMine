import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
// import CustomHeader from "../src/components/CustomHeader";
// import BRAND_COLORS from "../src/constants/colors";

const BRAND_COLORS = {
    PRIMARY_GREEN: "#bde1a0",
    BACKGROUND: "#FFFFFF",
    CARD_BG: "#FFFFFF",
    TEXT_DARK: "#333333",
    TEXT_LIGHT: "#666666",
    BORDER: "#E0E0E0",
};

const FAVORITE_TRACKS = [
  { id: "1", title: "Tháng Tư Là Lời Nói Dối Của Em", artist: "Hà Anh Tuấn", album: "Tiếng Gió Xôn Xao", cover: {uri: 'https://i.scdn.co/image/ab67616d0000b27343e7171e1a539199d75b31e9'}},
  { id: "2", title: "Nếu Những Tiếc Nuối", artist: "Vũ", album: "Bảo tàng của nuối tiếc", cover: {uri: 'https://i.scdn.co/image/ab67616d0000b273e8e244b7f32f22384a3290b0'}},
  { id: "3", title: "Mùa Mưa Ấy", artist: "Vũ", album: "Single", cover: {uri: 'https://i.scdn.co/image/ab67616d0000b273b88b7d620573e352c3c12658'}},
];

const FavoriteItem = ({ item }) => (
  <View style={itemStyles.container}>
    <View style={itemStyles.leftContent}>
      <Image source={item.cover} style={itemStyles.cover} />
      <Ionicons
        name="play-circle"
        size={24}
        color={BRAND_COLORS.PRIMARY_GREEN}
        style={itemStyles.playIcon}
      />
      <View style={itemStyles.textContainer}>
        <Text style={itemStyles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={itemStyles.subtitle} numberOfLines={1}>
          {Array.isArray(item.artist) ? item.artist.join(", ") : item.artist} •{" "}
          {item.album}
        </Text>
      </View>
    </View>
    <View style={itemStyles.rightIcons}>
      <TouchableOpacity style={itemStyles.iconButton}>
        <Feather name="menu" size={20} color={BRAND_COLORS.TEXT_LIGHT} />
      </TouchableOpacity>
      <TouchableOpacity style={itemStyles.iconButton}>
        <FontAwesome5 name="trash-alt" size={18} color={BRAND_COLORS.TEXT_LIGHT} />
      </TouchableOpacity>
    </View>
  </View>
);

export default function FavoritesScreen() {
  const renderItem = ({ item }) => (
    <FavoriteItem item={item} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* <CustomHeader /> */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={BRAND_COLORS.TEXT_LIGHT}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search favorites..."
            placeholderTextColor={BRAND_COLORS.TEXT_LIGHT}
          />
        </View>
        <FlatList
          data={FAVORITE_TRACKS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
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
  listContent: {
    paddingBottom: 20,
  },
});

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.CARD_BG,
    borderRadius: 10,
    borderColor: BRAND_COLORS.BORDER,
    borderWidth: 1,
    padding: 12,
    marginVertical: 6,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cover: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 10,
  },
  playIcon: {
    position: "absolute",
    left: 15,
    top: 15,
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.TEXT_DARK,
  },
  subtitle: {
    fontSize: 12,
    color: BRAND_COLORS.TEXT_LIGHT,
    marginTop: 5,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    paddingHorizontal: 8,
  },
});