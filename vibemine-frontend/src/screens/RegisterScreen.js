import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from "react-native-safe-area-context";

// !! QUAN TRỌNG: Đảm bảo địa chỉ IP này giống với địa chỉ bạn đã cấu hình ở LoginScreen.
const API_URL = 'http://172.20.10.2:8080'; // Ví dụ: 'http://192.168.1.10:8080'

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); // Thêm state cho username
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        // Kiểm tra mật khẩu có khớp không
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu và xác nhận mật khẩu không khớp.');
            return;
        }
        // Kiểm tra các trường có trống không
        if (!email || !username || !password) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/signup`, {
                username: username,
                email: email,
                password: password,
            });

            if (response.status === 201) { // 201 Created là mã thành công cho việc tạo mới
                Alert.alert(
                    'Đăng ký thành công!',
                    'Bây giờ bạn có thể đăng nhập với tài khoản vừa tạo.',
                    [
                        { text: 'OK', onPress: () => navigation.navigate('Login') }
                    ]
                );
            }
        } catch (error) {
            console.error(error.response.data);
            // Hiển thị thông báo lỗi từ backend (ví dụ: "Username đã tồn tại!")
            Alert.alert('Đăng ký thất bại', error.response.data || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Bạn có thể thêm Image component ở đây nếu có logo */}
            {/* <Image source={require('../../assets/your-logo.png')} style={styles.logoImage} /> */}
            
            <Text style={styles.title}>Create Your VibeMine Account</Text>
            <Text style={styles.subtitle}>Join VibeMine and start your journey with secure, personalized access.</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
                <Text>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
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
        backgroundColor: '#66DDAA', // Màu xanh mint
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
    loginContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    loginText: {
        color: '#66DDAA',
        fontWeight: 'bold',
    },
    logoImage: {
        width: 150,
        height: 150,
        marginBottom: 30,
    }
});