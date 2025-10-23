import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import CategoryTracksScreen from '../screens/CategoryTracksScreen'; // Import màn hình mới

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Ẩn header mặc định của Tab Navigator
        tabBarStyle: {
          backgroundColor: '#ffffff', // Màu nền tab bar
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5, // Tăng padding bottom cho iOS
          height: Platform.OS === 'ios' ? 80 : 60, // Tăng chiều cao cho iOS
        },
        tabBarActiveTintColor: '#9C27B0', // Màu icon/text active
        tabBarInactiveTintColor: 'gray', // Màu icon/text inactive
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') { // Đổi tên route để tránh trùng với Stack Screen
             iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FavoritesTab') {
             iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'PlaylistsTab') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          }
           // Fallback icon
          return <Ionicons name={iconName || 'alert-circle-outline'} size={26} color={color} />; // Tăng nhẹ size icon
        },
        tabBarLabelStyle: {
          fontSize: 11, // Giảm nhẹ font size label
          fontWeight: '600',
          marginTop: -5, // Dịch label lên chút
        },
         tabBarLabel: ({ focused, color }) => { // Custom label để có thể ẩn khi không focus (tùy chọn)
            let label;
            if (route.name === 'HomeTab') label = 'Trang chủ';
            else if (route.name === 'FavoritesTab') label = 'Yêu thích';
            else if (route.name === 'PlaylistsTab') label = 'Playlists';
            // return focused ? <Text style={{ color, fontSize: 11, fontWeight: '600', marginTop: -5 }}>{label}</Text> : null; // Chỉ hiện khi focus
             return <Text style={{ color, fontSize: 11, fontWeight: '600', marginTop: -5 }}>{label}</Text>; // Luôn hiện
         },
      })}
    >
      {/* Đổi tên các Screen trong Tab để không trùng với Stack */}
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }}/>
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ tabBarLabel: 'Yêu thích' }}/>
      <Tab.Screen name="PlaylistsTab" component={PlaylistsScreen} options={{ tabBarLabel: 'Playlists' }}/>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Ẩn header mặc định của Stack Navigator
        animation: 'slide_from_right', // Animation mặc định
      }}
    >
      {/* Màn hình chứa Tab Navigator là màn hình chính */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Màn hình Player mở dạng Modal */}
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          presentation: 'modal', // Kiểu modal
          animation: 'slide_from_bottom', // Animation từ dưới lên
        }}
      />

      {/* Màn hình danh sách bài hát theo danh mục (THÊM MỚI) */}
      <Stack.Screen
        name="CategoryTracks"
        component={CategoryTracksScreen}
        // options={{ headerShown: true, title: 'Danh sách bài hát' }} // Có thể hiện header nếu muốn
      />

       {/* Thêm các màn hình khác vào đây nếu cần (VD: AlbumDetail, ArtistDetail...) */}

    </Stack.Navigator>
  );
}