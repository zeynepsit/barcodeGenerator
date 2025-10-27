package com.example.demo.model;

import java.time.LocalDateTime;

public class OrderItemDTO {
    private Long id;
    private ProductDTO product;
    private String stockCode;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private LocalDateTime createdAt;
    
    public OrderItemDTO() {}
    
    public OrderItemDTO(OrderItem item) {
        this.id = item.getId();
        if (item.getProduct() != null) {
            this.product = new ProductDTO(item.getProduct());
        }
        this.stockCode = item.getStockCode();
        this.quantity = item.getQuantity();
        this.unitPrice = item.getUnitPrice();
        this.totalPrice = item.getTotalPrice();
        this.createdAt = item.getCreatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public ProductDTO getProduct() {
        return product;
    }
    
    public void setProduct(ProductDTO product) {
        this.product = product;
    }
    
    public String getStockCode() {
        return stockCode;
    }
    
    public void setStockCode(String stockCode) {
        this.stockCode = stockCode;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public Double getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public Double getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}



