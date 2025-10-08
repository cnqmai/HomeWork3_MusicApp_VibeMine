// src/main/java/com/vibemine/musicapp/controller/AuthController.java

package com.vibemine.musicapp.controller;

import com.vibemine.musicapp.model.User;
import com.vibemine.musicapp.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: Thay thế bằng các lớp DTO thực tế
class RegisterRequest {
    public String username;
    public String email;
    public String password;
}
class LoginRequest {
    public String username;
    public String password;
}
class AuthResponse {
    public String token;
    public String username;
}

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    // TODO: Cần thêm JwtUtils để tạo token

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

    /**
     * Endpoint Đăng nhập (sẽ trả về JWT Token)
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        
        User user = authService.findUserByUsername(loginRequest.username).orElse(null);

        // TODO: Cần thêm logic kiểm tra mật khẩu đã hash khi Spring Security được cấu hình.
        // Hiện tại, logic tìm kiếm được đơn giản hóa.
        if (user == null /* || !passwordEncoder.matches(loginRequest.password, user.getPassword())*/) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tên đăng nhập hoặc mật khẩu không đúng.");
        }
        
        // Sau khi xác thực thành công, tạo JWT Token
        String token = "MOCK_JWT_TOKEN"; 
        AuthResponse response = new AuthResponse();
        response.token = token;
        response.username = user.getUsername();
        
        // Trả về đối tượng AuthResponse (Thành công)
        return ResponseEntity.ok(response);
    }
}