package com.example.demo.model;

public enum UserRole {
    ADMIN("Yönetici"),
    USER("Kullanıcı"),
    MANAGER("Müdür");
    
    private final String displayName;
    
    UserRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}





