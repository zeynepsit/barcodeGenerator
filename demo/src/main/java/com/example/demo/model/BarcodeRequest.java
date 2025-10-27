package com.example.demo.model;

public class BarcodeRequest {
    private String productName;
    private String description;
    private Double price;
    private String category;
    private Integer stock;
    private String barcodeType; // EAN13, CODE128, QR_CODE
    
    public BarcodeRequest() {}
    
    public BarcodeRequest(String productName, String description, Double price, String category, Integer stock, String barcodeType) {
        this.productName = productName;
        this.description = description;
        this.price = price;
        this.category = category;
        this.stock = stock;
        this.barcodeType = barcodeType;
    }
    
    // Getters and Setters
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Double getPrice() {
        return price;
    }
    
    public void setPrice(Double price) {
        this.price = price;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Integer getStock() {
        return stock;
    }
    
    public void setStock(Integer stock) {
        this.stock = stock;
    }
    
    public String getBarcodeType() {
        return barcodeType;
    }
    
    public void setBarcodeType(String barcodeType) {
        this.barcodeType = barcodeType;
    }
}
