// src/main/java/com/vibemine/musicapp/config/WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Cho phép frontend chạy trên mọi cổng truy cập vào API backend
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:19000", "http://localhost:8081") // Thêm các domain/port của Expo
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}