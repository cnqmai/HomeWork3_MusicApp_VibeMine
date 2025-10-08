// src/main/java/com/vibemine/musicapp/service/AuthService.java

package com.vibemine.musicapp.service;

import com.vibemine.musicapp.model.User;
import com.vibemine.musicapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // Cần thêm JwtService sau khi cấu hình Spring Security

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Thực hiện logic đăng ký người dùng mới.
     * @param user Đối tượng User chứa thông tin đăng ký (chưa hash mật khẩu).
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

        // Mã hóa mật khẩu trước khi lưu
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Thực hiện logic đăng nhập (chỉ kiểm tra tồn tại và trả về User).
     * Logic kiểm tra mật khẩu và tạo JWT token sẽ được xử lý trong SecurityConfig.
     * @param username Tên đăng nhập.
     * @return User.
     */
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // TODO: Triển khai logic tạo JWT Token cho đăng nhập (sẽ cần JwtService)
}