// src/main/java/com/vibemine/musicapp/service/AuthService.java

package com.vibemine.musicapp.service;

import com.vibemine.musicapp.model.User;
import com.vibemine.musicapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Thực hiện logic đăng ký người dùng mới.
     * Mật khẩu được lưu dưới dạng clear-text (KHÔNG AN TOÀN)
     * @param user Đối tượng User chứa thông tin đăng ký.
     * @return User đã được lưu vào DB.
     * @throws RuntimeException nếu username hoặc email đã tồn tại.
     */
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username đã tồn tại!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        // Lưu mật khẩu clear-text
        return userRepository.save(user);
    }

    /**
     * Tìm kiếm User bằng username và kiểm tra mật khẩu (thủ công)
     * @param username Tên đăng nhập.
     * @param password Mật khẩu clear-text.
     * @return User đã xác thực.
     */
    public Optional<User> authenticateUser(String username, String password) {
        return userRepository.findByUsername(username)
            .filter(user -> user.getPassword().equals(password)); // Kiểm tra mật khẩu clear-text
    }
}