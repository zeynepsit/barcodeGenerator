package com.example.demo.model;

public enum OrderStatus {
    PENDING("Beklemede"),
    APPROVED("Onaylandı"),
    PROCESSING("İşleniyor"),
    SHIPPED("Kargoya Verildi"),
    DELIVERED("Teslim Edildi"),
    CANCELLED("İptal");
    
    private final String displayName;
    
    OrderStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

