package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {
    private Long id;
    private String orderNumber;
    private String customerName;
    private String address;
    private String phone;
    private String email;
    private String cargoCampaignCode;
    private String stockCode;
    private String barcode;
    private String deliveryAddress;
    private String brand;
    private Integer totalItems;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDTO> orderItems;
    
    public OrderDTO() {}
    
    public OrderDTO(Order order, List<OrderItem> orderItems) {
        this.id = order.getId();
        this.orderNumber = order.getOrderNumber();
        this.customerName = order.getCustomerName();
        this.address = order.getAddress();
        this.phone = order.getPhone();
        this.email = order.getEmail();
        this.cargoCampaignCode = order.getCargoCampaignCode();
        this.stockCode = order.getStockCode();
        this.barcode = order.getBarcode();
        this.deliveryAddress = order.getDeliveryAddress();
        this.brand = order.getBrand();
        this.totalItems = order.getTotalItems();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus() != null ? order.getStatus().toString() : null;
        this.createdAt = order.getCreatedAt();
        this.updatedAt = order.getUpdatedAt();
        
        // OrderItem'ları OrderItemDTO'ya dönüştür
        this.orderItems = new java.util.ArrayList<>();
        if (orderItems != null) {
            for (OrderItem item : orderItems) {
                this.orderItems.add(new OrderItemDTO(item));
            }
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getCargoCampaignCode() {
        return cargoCampaignCode;
    }
    
    public void setCargoCampaignCode(String cargoCampaignCode) {
        this.cargoCampaignCode = cargoCampaignCode;
    }
    
    public String getStockCode() {
        return stockCode;
    }
    
    public void setStockCode(String stockCode) {
        this.stockCode = stockCode;
    }
    
    public String getBarcode() {
        return barcode;
    }
    
    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }
    
    public String getDeliveryAddress() {
        return deliveryAddress;
    }
    
    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }
    
    public String getBrand() {
        return brand;
    }
    
    public void setBrand(String brand) {
        this.brand = brand;
    }
    
    public Integer getTotalItems() {
        return totalItems;
    }
    
    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }
    
    public Double getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<OrderItemDTO> getOrderItems() {
        return orderItems;
    }
    
    public void setOrderItems(List<OrderItemDTO> orderItems) {
        this.orderItems = orderItems;
    }
}

