package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public AuthResponse login(LoginRequest loginRequest) {
        // Önce kullanıcıyı bul ve aktif mi kontrol et
        User user = userRepository.findByUsername(loginRequest.getUsername())
            .orElseThrow(() -> new RuntimeException("Kullanıcı adı veya şifre hatalı!"));
        
        // Kullanıcı aktif değilse (admin onayı bekliyorsa) hata ver
        if (user.getIsActive() == null || !user.getIsActive()) {
            throw new RuntimeException("Hesabınız henüz onaylanmamış. Lütfen admin onayını bekleyin.");
        }
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userPrincipal);
        
        return new AuthResponse(
            jwt,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole()
        );
    }
    
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Kullanıcı adı zaten kullanılıyor!");
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("E-posta adresi zaten kullanılıyor!");
        }
        
        User user = new User(
            registerRequest.getUsername(),
            registerRequest.getEmail(),
            passwordEncoder.encode(registerRequest.getPassword()),
            registerRequest.getFirstName(),
            registerRequest.getLastName()
        );
        
        user.setPhone(registerRequest.getPhone());
        user.setRole(UserRole.USER);
        user.setIsActive(false); // Admin onayı bekler
        
        User savedUser = userRepository.save(user);
        
        // Kayıt başarılı ama login yapamaz (isActive = false)
        // Token yerine null döndür, frontend'de onay mesajı göster
        return new AuthResponse(
            null, // Token yok
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            savedUser.getRole()
        );
    }
}

