import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Text, View } from 'react-native'; // Thêm Platform, Text, View
import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import CategoryTracksScreen from '../screens/CategoryTracksScreen';
import HistoryScreen from '../screens/HistoryScreen'; // --- THÊM MỚI ---

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
           paddingBottom: Platform.OS === 'ios' ? 30 : 5, // Tăng padding bottom cho iOS
           height: Platform.OS === 'ios' ? 90 : 60, // Tăng chiều cao cho iOS
        },
        tabBarActiveTintColor: '#9C27B0',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
             iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'FavoritesTab') {
             iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'PlaylistsTab') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else if (route.name === 'HistoryTab') { // --- THÊM MỚI ---
            iconName = focused ? 'time' : 'time-outline'; // --- THÊM MỚI ---
          }
          return <Ionicons name={iconName || 'alert-circle-outline'} size={26} color={color} />;
        },
         tabBarLabel: ({ focused, color }) => {
            let label;
            if (route.name === 'HomeTab') label = 'Trang chủ';
            else if (route.name === 'FavoritesTab') label = 'Yêu thích';
            else if (route.name === 'PlaylistsTab') label = 'Playlists';
            else if (route.name === 'HistoryTab') label = 'Lịch sử'; // --- THÊM MỚI ---
            
            // Ẩn label nếu không được focus (tùy chọn)
            // if (!focused) return null; 
            
            return <Text style={{ color, fontSize: 11, fontWeight: '600', marginTop: -5 }}>{label}</Text>;
         },
         tabBarLabelStyle: { // Style này vẫn áp dụng cho Text trả về từ tabBarLabel
            fontSize: 11,
            fontWeight: '600',
            marginTop: -5,
         }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }}/>
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ tabBarLabel: 'Yêu thích' }}/>
      <Tab.Screen name="PlaylistsTab" component={PlaylistsScreen} options={{ tabBarLabel: 'Playlists' }}/>
      {/* --- THÊM MỚI --- */}
      <Tab.Screen name="HistoryTab" component={HistoryScreen} options={{ tabBarLabel: 'Lịch sử' }}/>
      {/* --- KẾT THÚC THÊM MỚI --- */}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="CategoryTracks"
        component={CategoryTracksScreen}
      />
    </Stack.Navigator>
  );
}