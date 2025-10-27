package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updateUserPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("password");
            
            // Mevcut kullanıcıyı al
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = auth.getName();
            Optional<User> currentUserOpt = userRepository.findById(id);
            
            if (!currentUserOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Kullanıcı bulunamadı"));
            }
            
            User currentUser = currentUserOpt.get();
            
            // Kendi şifresini mi değiştiriyor yoksa admin başkasınınkini mi?
            if (!currentUser.getId().equals(id) && !currentUser.getRole().equals(UserRole.ADMIN)) {
                // Kendi şifresi değil ve admin değil → İzinsiz
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Bu işlem için yetkiniz yok"));
            }
            
            User updatedUser = userService.updateUserPassword(id, newPassword);
            if (updatedUser != null) {
                System.out.println("✅ Şifre güncellendi - ID: " + id + " by " + currentUsername);
                return ResponseEntity.ok(updatedUser);
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("❌ Şifre güncelleme hatası: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Şifre güncellenirken hata oluştu"));
        }
    }
    
    @PutMapping("/me/password")
    public ResponseEntity<?> updateMyPassword(@RequestBody Map<String, String> request) {
        try {
            System.out.println("📥 Request alındı: " + request);
            
            String newPassword = request.get("password");
            System.out.println("🔑 Yeni şifre: " + (newPassword != null ? "***" : "null"));
            
            if (newPassword == null || newPassword.isEmpty()) {
                System.out.println("❌ Şifre boş!");
                return ResponseEntity.badRequest().body(Map.of("error", "Şifre boş olamaz"));
            }
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🔐 Authentication: " + auth);
            System.out.println("🔐 Principal: " + auth.getPrincipal());
            System.out.println("🔐 Name: " + auth.getName());
            
            String username = auth.getName();
            System.out.println("👤 Şifre güncelleme isteği - Username: " + username);
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            System.out.println("🔍 Kullanıcı bulundu mu: " + userOpt.isPresent());
            
            if (userOpt.isPresent()) {
                User updatedUser = userService.updateUserPassword(userOpt.get().getId(), newPassword);
                if (updatedUser != null) {
                    System.out.println("✅ Şifre güncellendi: " + username);
                    return ResponseEntity.ok(updatedUser);
                }
            }
            
            System.out.println("❌ Kullanıcı bulunamadı: " + username);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.out.println("❌ Şifre güncelleme hatası: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Şifre güncellenirken hata oluştu: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> activateUser(@PathVariable Long id) {
        User user = userService.activateUser(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> deactivateUser(@PathVariable Long id) {
        User user = userService.deactivateUser(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

