package com.example.demo.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;

@Configuration
public class JwtConfig {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Bean
    public SecretKey secretKey() {
        // Secret key'i güvenli hale getir
        if (secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret key en az 32 karakter olmalıdır");
        }
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}



