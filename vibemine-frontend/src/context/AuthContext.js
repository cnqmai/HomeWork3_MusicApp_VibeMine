import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);

    // Hàm đăng nhập: nhận token và userId, lưu vào state và AsyncStorage
    const login = async (token, id) => {
        setUserToken(token);
        setUserId(id);
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', String(id));
        } catch (e) {
            console.log(e);
        }
    };

    // Hàm đăng xuất: xóa token và userId
    const logout = async () => {
        setUserToken(null);
        setUserId(null);
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};