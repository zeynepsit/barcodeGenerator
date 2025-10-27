package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User createUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Kullanıcı adı zaten kullanılıyor!");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("E-posta adresi zaten kullanılıyor!");
        }
        
        User user = new User(
            request.getUsername(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            request.getFirstName(),
            request.getLastName()
        );
        
        user.setPhone(request.getPhone());
        user.setRole(UserRole.USER);
        
        return userRepository.save(user);
    }
    
    public User createAdminUser() {
        // Admin kullanıcısı oluştur (sadece bir kez)
        if (userRepository.findByUsername("admin").isPresent()) {
            return userRepository.findByUsername("admin").get();
        }
        
        User admin = new User(
            "admin",
            "admin@barkodmarket.com",
            passwordEncoder.encode("admin123"),
            "Admin",
            "User"
        );
        
        admin.setRole(UserRole.ADMIN);
        admin.setPhone("+90 555 000 0000");
        admin.setIsActive(true); // Admin otomatik aktif
        
        return userRepository.save(admin);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public User updateUser(Long id, User updatedUser) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setEmail(updatedUser.getEmail());
            user.setPhone(updatedUser.getPhone());
            user.setRole(updatedUser.getRole());
            user.setIsActive(updatedUser.getIsActive());
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        return null;
    }
    
    public User updateUserPassword(Long id, String newPassword) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        return null;
    }
    
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public User activateUser(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(true);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        return null;
    }
    
    public User deactivateUser(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(false);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        return null;
    }
}

