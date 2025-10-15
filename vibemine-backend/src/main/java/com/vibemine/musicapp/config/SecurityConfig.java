package com.vibemine.musicapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Vô hiệu hóa CSRF vì chúng ta đang xây dựng API stateless
            .csrf(csrf -> csrf.disable()) 
            
            // Cấu hình quy tắc cho các request HTTP
            .authorizeHttpRequests(auth -> auth
                // Cho phép tất cả các request đến /api/auth/** (đăng nhập, đăng ký)
                .requestMatchers("/api/auth/**").permitAll() 
                // Tất cả các request khác đều yêu cầu phải xác thực
                .anyRequest().authenticated() 
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}