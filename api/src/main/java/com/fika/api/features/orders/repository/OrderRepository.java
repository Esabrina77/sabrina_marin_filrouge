package com.fika.api.features.orders.repository;

import com.fika.api.features.orders.dto.OrderResponse;
import com.fika.api.features.orders.model.Order;
import com.fika.api.features.orders.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserEmailOrderByCreatedAtDesc(String email);
    boolean existsByOrderReference(String orderReference);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findAllByStatusOrderByCreatedAtAsc(OrderStatus status);
}
