// src/main/java/com/vibemine/musicapp/config/WebConfig.java

package com.vibemine.musicapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Cho phép frontend React Native truy cập
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:19000", "http://10.0.2.2:8081", "exp://*") // Thêm các địa chỉ của Expo
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}