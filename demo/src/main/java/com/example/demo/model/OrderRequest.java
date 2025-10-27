package com.example.demo.model;

import java.util.List;

public class OrderRequest {
    private String customerName;
    private String address;
    private String phone;
    private String email;
    private String cargoCampaignCode;
    private List<OrderItemRequest> items;
    
    public OrderRequest() {}
    
    public OrderRequest(String customerName, String address, String phone, String email, String cargoCampaignCode, List<OrderItemRequest> items) {
        this.customerName = customerName;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.cargoCampaignCode = cargoCampaignCode;
        this.items = items;
    }
    
    // Getters and Setters
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
    
    public List<OrderItemRequest> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}

