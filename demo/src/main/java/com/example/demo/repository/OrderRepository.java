package com.example.demo.repository;

import com.example.demo.model.Order;
import com.example.demo.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findByStatus(OrderStatus status);
    
    List<Order> findByCustomerNameContainingIgnoreCase(String customerName);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.customerName LIKE %:searchTerm% OR o.orderNumber LIKE %:searchTerm% OR o.address LIKE %:searchTerm%")
    List<Order> searchOrders(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") OrderStatus status);
}



