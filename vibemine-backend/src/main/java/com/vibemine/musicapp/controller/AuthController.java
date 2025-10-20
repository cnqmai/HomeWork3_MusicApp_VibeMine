// src/main/java/com/vibemine/musicapp/controller/AuthController.java (FINAL VERSION - Simple Auth)

package com.vibemine.musicapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vibemine.musicapp.model.User;
import com.vibemine.musicapp.service.AuthService;

// DTOs
class RegisterRequest {
    public String username;
    public String email;
    public String password;
}

class LoginRequest {
    public String username;
    public String password;
}

class SimpleAuthResponse {
    public String message;
    public Long userId;
}

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // allow all origins for quick local testing
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint Đăng ký người dùng mới
     */
    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest signUpRequest) {
        try {
            // Tạo đối tượng User từ Request (Lưu ý: Constructor phải khớp với User.java)
            User newUser = new User(
                null, 
                signUpRequest.username, 
                signUpRequest.email, 
                signUpRequest.password, 
                "USER", 
                null, 
                null
            );
            authService.registerUser(newUser);
            return new ResponseEntity<>("Đăng ký thành công!", HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- ADDED: simple ping endpoint for connectivity testing ---
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        System.out.println("[PING] Received ping request");
        return ResponseEntity.ok("pong");
    }

    /**
     * Endpoint Đăng nhập (Xác thực thủ công bằng if/else để tránh lỗi kiểu)
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // --- ADDED: quick log to show request reached controller ---
        System.out.println("[LOGIN] Received login request for username: " + loginRequest.username);

        // Gọi service để xác thực và nhận lại Optional<User>
        User user = authService.authenticateUser(loginRequest.username, loginRequest.password).orElse(null);

        // Kiểm tra kết quả
        if (user == null) {
            // Đăng nhập thất bại
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tên đăng nhập hoặc mật khẩu không đúng.");
        }
        
        // Đăng nhập thành công (Trả về ID User)
        SimpleAuthResponse response = new SimpleAuthResponse();
        response.message = "Đăng nhập thành công";
        response.userId = user.getId();
        
        // Trả về ResponseEntity<SimpleAuthResponse>
        return ResponseEntity.ok(response);
    }
}