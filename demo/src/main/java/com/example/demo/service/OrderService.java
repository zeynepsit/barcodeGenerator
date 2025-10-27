package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.OrderItemRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public Order createOrder(OrderRequest request) {
        // Sipariş numarası oluştur
        String orderNumber = generateOrderNumber();
        
        // Sipariş oluştur
        Order order = new Order(
            orderNumber,
            request.getCustomerName(),
            request.getAddress(),
            request.getPhone(),
            request.getEmail()
        );
        
        order.setCargoCampaignCode(request.getCargoCampaignCode());
        
        // Siparişi kaydet
        Order savedOrder = orderRepository.save(order);
        
        // Sipariş kalemlerini oluştur
        int totalItems = 0;
        double totalAmount = 0.0;
        
        for (OrderItemRequest itemRequest : request.getItems()) {
            Optional<Product> productOpt = productRepository.findById(itemRequest.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                OrderItem orderItem = new OrderItem(
                    savedOrder,
                    product,
                    itemRequest.getQuantity(),
                    0.0
                );
                
                orderItemRepository.save(orderItem);
                
                totalItems += itemRequest.getQuantity();
                totalAmount += orderItem.getTotalPrice();
            }
        }
        
        // Toplam bilgileri güncelle
        savedOrder.setTotalItems(totalItems);
        savedOrder.setTotalAmount(totalAmount);
        
        return orderRepository.save(savedOrder);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getAllOrdersWithItems() {
        List<Order> orders = orderRepository.findAll();
        // OrderItems'ları yükle
        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            // OrderItem'lardaki Product'ları yükle (lazy loading problemini çöz)
            for (OrderItem item : items) {
                if (item.getProduct() != null) {
                    // Product'ı force load et
                    item.getProduct().getId();
                }
            }
            order.setOrderItems(items);
        }
        return orders;
    }
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    public Optional<Order> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }
    
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    public List<Order> searchOrders(String searchTerm) {
        return orderRepository.searchOrders(searchTerm);
    }
    
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByDateRange(startDate, endDate);
    }
    
    public Order updateOrderStatus(Long id, OrderStatus status) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            // Status değiştiğinde updatedAt'i güncelle
            order.setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(order);
        }
        return null;
    }
    
    public boolean deleteOrder(Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }
    
    private String generateOrderNumber() {
        // Benzersiz sipariş numarası oluştur
        return "ORD" + System.currentTimeMillis();
    }
}
