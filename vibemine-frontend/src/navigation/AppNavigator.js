import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import AuthContext
import { AuthContext } from '../context/AuthContext';

// Import các màn hình
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlayerScreen from '../screens/PlayerScreen'; 

const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator(); // Stack chính để chứa cả tab và màn hình Player

// Tab Navigator cho các màn hình chính sau khi đăng nhập
function MainAppTabs() {
    return (
        <MainTab.Navigator screenOptions={{ headerShown: false }}>
            <MainTab.Screen name="Home" component={HomeScreen} />
            <MainTab.Screen name="Playlists" component={PlaylistsScreen} />
            <MainTab.Screen name="Favorites" component={FavoritesScreen} />
            {/* Đã loại bỏ màn hình History khỏi thanh điều hướng chính */}
        </MainTab.Navigator>
    );
}

// Stack Navigator cho luồng xác thực
function AuthFlow() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

// Cấu trúc Navigator tổng
export default function AppNavigator() {
    const { userToken } = useContext(AuthContext); 

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {userToken == null ? (
                    // Nếu chưa đăng nhập, hiển thị luồng xác thực
                    <RootStack.Screen name="Auth" component={AuthFlow} />
                ) : (
                    <>
                        <RootStack.Screen name="App" component={MainAppTabs} />
                        {/* THÊM DÒNG NÀY ĐỂ ĐĂNG KÝ MÀN HÌNH PLAYER */}
                        <RootStack.Screen name="Player" component={PlayerScreen} /> 
                    </>
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
}