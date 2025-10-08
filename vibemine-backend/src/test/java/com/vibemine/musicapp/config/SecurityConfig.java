// src/main/java/com/vibemine/musicapp/config/SecurityConfig.java

package com.vibemine.musicapp.config;

import com.vibemine.musicapp.service.AuthService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthService authService;
    
    public SecurityConfig(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Cấu hình PasswordEncoder (BCrypt là bắt buộc để hash mật khẩu)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cấu hình chuỗi Filter Bảo mật đơn giản (Cho phép mọi request truy cập)
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Vô hiệu hóa CSRF
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // 🌟 CHO PHÉP TẤT CẢ REQUEST TRUY CẬP 🌟
            );

        return http.build();
    }
    
    // Giữ lại UserDetailsService để AuthService có thể hoạt động
    // (Mặc dù nó không được dùng để lọc request)
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> authService.findUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy User với username: " + username));
    }
}