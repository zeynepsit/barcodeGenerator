package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "*")
public class AdminSetupController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @GetMapping("/create-admin")
    public Map<String, Object> createAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Admin var mı kontrol et
            if (userRepository.findByUsername("admin").isPresent()) {
                response.put("success", false);
                response.put("message", "Admin kullanıcısı zaten mevcut");
                return response;
            }
            
            // Admin oluştur
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@barkodmarket.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(UserRole.ADMIN);
            admin.setIsActive(true);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(admin);
            
            response.put("success", true);
            response.put("message", "Admin kullanıcısı başarıyla oluşturuldu");
            response.put("username", "admin");
            response.put("password", "admin123");
            response.put("email", "admin@barkodmarket.com");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }
    
    @GetMapping("/check-admin")
    public Map<String, Object> checkAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            var adminOpt = userRepository.findByUsername("admin");
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                response.put("exists", true);
                response.put("username", admin.getUsername());
                response.put("email", admin.getEmail());
                response.put("role", admin.getRole());
                response.put("active", admin.getIsActive());
            } else {
                response.put("exists", false);
                response.put("message", "Admin kullanıcısı bulunamadı");
            }
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }
        
        return response;
    }
}





