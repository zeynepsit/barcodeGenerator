package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public Product createProduct(Product product) {
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    public Optional<Product> getProductByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode);
    }
    
    public List<Product> searchProducts(String searchTerm) {
        return productRepository.searchProducts(searchTerm);
    }
    
    public List<Product> getProductsByStockCode(String stockCode) {
        return productRepository.findByStockCode(stockCode)
            .map(List::of)
            .orElse(List.of());
    }
    
    public List<Product> getLowStockProducts(Integer threshold) {
        return productRepository.findByStockLessThan(threshold);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setStock(productDetails.getStock());
            product.setUpdatedAt(LocalDateTime.now());
            return productRepository.save(product);
        }
        return null;
    }
    
    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public Product updateStock(Long id, Integer newStock) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setStock(newStock);
            product.setUpdatedAt(LocalDateTime.now());
            return productRepository.save(product);
        }
        return null;
    }
}



