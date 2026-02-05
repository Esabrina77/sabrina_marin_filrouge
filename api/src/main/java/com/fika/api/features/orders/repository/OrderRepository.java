package com.fika.api.features.orders.repository;

import com.fika.api.features.orders.model.Order;
import com.fika.api.features.orders.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserEmailOrderByCreatedAtDesc(String email, Pageable pageable);

    boolean existsByOrderReference(String orderReference);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Order> findAllByStatusOrderByCreatedAtAsc(OrderStatus status, Pageable pageable);
}
