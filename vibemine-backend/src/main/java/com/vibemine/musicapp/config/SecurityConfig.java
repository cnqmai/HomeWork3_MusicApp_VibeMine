package com.vibemine.musicapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                // Cho phép tất cả các request bắt đầu bằng /api/v1/
                .requestMatchers("/api/v1/**").permitAll() 
                // (Tùy chọn) Cho phép tất cả các request khác (ví dụ: /login nếu bạn muốn giữ lại)
                .anyRequest().permitAll() 
            )
            .csrf(csrf -> csrf.disable()) // Tắt CSRF (Thường cần thiết cho API)
            .httpBasic(withDefaults()); // (Tùy chọn) Bật Basic Auth nếu cần

        return http.build();
    }
}