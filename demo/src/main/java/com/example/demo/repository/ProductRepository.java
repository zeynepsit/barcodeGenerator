package com.example.demo.repository;

import com.example.demo.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findByBarcode(String barcode);
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    Optional<Product> findByStockCode(String stockCode);
    
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:searchTerm% OR p.description LIKE %:searchTerm% OR p.barcode LIKE %:searchTerm% OR p.stockCode LIKE %:searchTerm%")
    List<Product> searchProducts(@Param("searchTerm") String searchTerm);
    
    List<Product> findByStockLessThan(Integer stock);
}
