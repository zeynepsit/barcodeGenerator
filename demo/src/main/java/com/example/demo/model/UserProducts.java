package com.example.demo.model;

import java.util.List;

public class UserProducts {
    private String userName; // Kullanıcı adı
    private List<String> products; // Kullanıcının aldığı ürünlerin listesi

    public UserProducts(String userName, List<String> products) {
        this.userName = userName;
        this.products = products;
    }

    // Getter ve Setter metotları
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public List<String> getProducts() {
        return products;
    }

    public void setProducts(List<String> products) {
        this.products = products;
    }
}
