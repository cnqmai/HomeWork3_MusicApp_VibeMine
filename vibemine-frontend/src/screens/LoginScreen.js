import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = 'http://192.168.100.190:8080'; // Giữ nguyên IP bạn đã cấu hình
// 192.168.100.190: Nhà
// 172.20.10.2: 4g su

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        // --- LOG 1: KIỂM TRA DỮ LIỆU TRƯỚC KHI GỬI ---
        console.log(`Đang thử đăng nhập với: Username=${username}, Password=${password}`);

        if (!username || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                {
                    username: username,
                    password: password,
                },
                {
                    timeout: 7000, // 7 seconds timeout
                }
            );
            
            // --- LOG 2: KIỂM TRA KẾT QUẢ TRẢ VỀ KHI THÀNH CÔNG ---
            console.log('Đăng nhập thành công! Phản hồi từ server:', JSON.stringify(response.data, null, 2));

            if (response.status === 200) {
                const { userId } = response.data;
                login('dummy-token', userId);
            }
        } catch (error) {
            // --- LOG 3: KIỂM TRA CHI TIẾT LỖI KHI THẤT BẠI ---
            if (error.response) {
                // Lỗi từ phía server (ví dụ: 401, 404, 500)
                console.error('Lỗi phản hồi từ server:', JSON.stringify(error.response.data, null, 2));
                console.error('Mã trạng thái:', error.response.status);
            } else if (error.request) {
                // Yêu cầu đã được gửi đi nhưng không nhận được phản hồi (ví dụ: sai IP, backend không chạy)
                console.error('Không nhận được phản hồi từ server. Yêu cầu:', error.request);
                if (error.code === 'ECONNABORTED') {
                    Alert.alert('Lỗi kết nối', 'Yêu cầu đăng nhập đã hết thời gian chờ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
                } else {
                    Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại địa chỉ IP và đảm bảo backend đang chạy.');
                }
            } else {
                // Lỗi xảy ra khi thiết lập yêu cầu
                console.error('Lỗi khi thiết lập yêu cầu:', error.message);
            }
            
            if (!error.request) { // Chỉ hiện alert này nếu không phải lỗi kết nối
                Alert.alert('Đăng nhập thất bại', 'Tên đăng nhập hoặc mật khẩu không đúng.');
            }
        }
    };

    // Phần JSX (giao diện) giữ nguyên...
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>VibeMine</Text>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.line} />
            </View>

            <View style={styles.registerContainer}>
                <Text>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerText}>Register Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Phần styles giữ nguyên...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#66DDAA',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        color: '#66DDAA',
        marginTop: 15,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    orText: {
        marginHorizontal: 10,
        color: '#888',
    },
    registerContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    registerText: {
        color: '#66DDAA',
        fontWeight: 'bold',
    },
});