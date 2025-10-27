package com.example.demo.model;

public class ProductDTO {
    private Long id;
    private String name;
    private String barcode;
    private String stockCode;
    private String description;
    private Double price;
    private Integer stock;
    
    public ProductDTO() {}
    
    public ProductDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.barcode = product.getBarcode();
        this.stockCode = product.getStockCode();
        this.description = product.getDescription();
        this.stock = product.getStock();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getBarcode() {
        return barcode;
    }
    
    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }
    
    public String getStockCode() {
        return stockCode;
    }
    
    public void setStockCode(String stockCode) {
        this.stockCode = stockCode;
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
    
    public Integer getStock() {
        return stock;
    }
    
    public void setStock(Integer stock) {
        this.stock = stock;
    }
}

