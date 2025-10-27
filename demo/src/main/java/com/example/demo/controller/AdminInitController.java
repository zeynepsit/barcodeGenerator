package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminInitController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        try {
            User admin = userService.createAdminUser();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin kullanıcısı oluşturuldu");
            response.put("username", admin.getUsername());
            response.put("password", "admin123");
            response.put("email", admin.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Admin oluşturulamadı: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}





