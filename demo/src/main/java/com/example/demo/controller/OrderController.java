package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.service.OrderService;
import com.example.demo.service.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private BarcodeService barcodeService;
    
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<Order> orders = orderService.getAllOrdersWithItems();
        List<OrderDTO> orderDTOs = new java.util.ArrayList<>();
        for (Order order : orders) {
            orderDTOs.add(new OrderDTO(order, order.getOrderItems()));
        }
        return ResponseEntity.ok(orderDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderService.getOrderById(id);
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        Optional<Order> order = orderService.getOrderByNumber(orderNumber);
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<Order> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Order>> searchOrders(@RequestParam String q) {
        List<Order> orders = orderService.searchOrders(q);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}/items")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable Long id) {
        List<OrderItem> items = orderService.getOrderItems(id);
        return ResponseEntity.ok(items);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateRequest request) {
        Order order = orderService.updateOrderStatus(id, request.getStatus());
        if (order != null) {
            return ResponseEntity.ok(order);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        boolean deleted = orderService.deleteOrder(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{id}/label")
    public ResponseEntity<byte[]> generateOrderLabel(@PathVariable Long id) {
        try {
            Optional<Order> orderOpt = orderService.getOrderById(id);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                
                // Sipariş etiketi için barkod oluştur
                String barcodeData = order.getOrderNumber() + "|" + order.getCargoCampaignCode();
                byte[] barcodeImage = barcodeService.generateCode128Barcode(barcodeData, 300, 100);
                
                return ResponseEntity.ok()
                    .header("Content-Type", "image/png")
                    .body(barcodeImage);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    // Status update request model
    public static class OrderStatusUpdateRequest {
        private OrderStatus status;
        
        public OrderStatus getStatus() {
            return status;
        }
        
        public void setStatus(OrderStatus status) {
            this.status = status;
        }
    }
}
