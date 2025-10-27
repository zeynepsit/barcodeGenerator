package com.example.demo.controller;

import com.example.demo.model.BarcodeRequest;
import com.example.demo.model.Product;
import com.example.demo.service.BarcodeService;
import com.example.demo.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/barcode")
@CrossOrigin(origins = "http://localhost:3000")
public class BarcodeController {
    
    @Autowired
    private BarcodeService barcodeService;
    
    @Autowired
    private ProductService productService;
    
    @PostMapping("/generate")
    public ResponseEntity<Product> generateBarcode(@RequestBody BarcodeRequest request) {
        try {
            // BarcodeRequest'ten Product oluştur
            Product product = new Product();
            product.setName(request.getProductName());
            product.setBarcode(request.getProductName()); // Barkod olarak ürün adını kullan
            product.setDescription(request.getDescription());
            
            product.setStock(100); // Varsayılan stok
            
            Product savedProduct = productService.createProduct(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/image/{barcode}")
    public ResponseEntity<byte[]> getBarcodeImage(@PathVariable String barcode, 
                                                @RequestParam(defaultValue = "QR_CODE") String type,
                                                @RequestParam(defaultValue = "300") int width,
                                                @RequestParam(defaultValue = "300") int height) {
        try {
            byte[] imageBytes;
            
            switch (type.toUpperCase()) {
                case "QR_CODE":
                    imageBytes = barcodeService.generateQRCode(barcode, width, height);
                    break;
                case "EAN13":
                    imageBytes = barcodeService.generateEAN13Barcode(barcode, width, height);
                    break;
                case "CODE128":
                    imageBytes = barcodeService.generateCode128Barcode(barcode, width, height);
                    break;
                default:
                    imageBytes = barcodeService.generateQRCode(barcode, width, height);
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(imageBytes.length);
            
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/products/barcode/{barcode}")
    public ResponseEntity<Product> getProductByBarcode(@PathVariable String barcode) {
        Optional<Product> product = productService.getProductByBarcode(barcode);
        return product.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String q) {
        List<Product> products = productService.searchProducts(q);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/products/stockcode/{stockCode}")
    public ResponseEntity<List<Product>> getProductsByStockCode(@PathVariable String stockCode) {
        List<Product> products = productService.getProductsByStockCode(stockCode);
        return ResponseEntity.ok(products);
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product updatedProduct = productService.updateProduct(id, product);
        if (updatedProduct != null) {
            return ResponseEntity.ok(updatedProduct);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        boolean deleted = productService.deleteProduct(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
