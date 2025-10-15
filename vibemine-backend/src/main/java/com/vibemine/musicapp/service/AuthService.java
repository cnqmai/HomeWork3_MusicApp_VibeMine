package com.vibemine.musicapp.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vibemine.musicapp.model.User;
import com.vibemine.musicapp.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username đã tồn tại!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> authenticateUser(String username, String password) {
        System.out.println("\n--- BẮT ĐẦU XÁC THỰC ---");
        System.out.println("Username nhận được từ request: " + username);
        System.out.println("Password nhận được từ request: " + password);

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            System.out.println("[KẾT QUẢ]: Lỗi - Không tìm thấy user nào có username là '" + username + "' trong database.");
            System.out.println("--- KẾT THÚC XÁC THỰC ---\n");
            return Optional.empty();
        }

        User user = userOptional.get();
        String storedPasswordHash = user.getPassword();
        System.out.println("Mật khẩu đã mã hóa trong DB của user '" + username + "': " + storedPasswordHash);

        boolean passwordsMatch = passwordEncoder.matches(password, storedPasswordHash);
        System.out.println("So sánh '" + password + "' với hash ở trên... Kết quả: " + passwordsMatch);
        System.out.println("--- KẾT THÚC XÁC THỰC ---\n");

        if (passwordsMatch) {
            return userOptional;
        } else {
            return Optional.empty();
        }
    }
}