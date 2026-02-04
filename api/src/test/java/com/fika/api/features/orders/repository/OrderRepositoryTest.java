package com.fika.api.features.orders.repository;

import com.fika.api.features.orders.model.Order;
import com.fika.api.features.orders.model.OrderStatus;
import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@DisplayName("Repository : Orders")
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("test@example.com")
                .password("password")
                .role(Role.CLIENT)
                .build();
        userRepository.save(user);
    }

    @Test
    @DisplayName("findByUserEmailOrderByCreatedAtDesc : Retourne les commandes triées")
    void findByUserEmailOrderByCreatedAtDesc() {
        Order order1 = Order.builder()
                .user(user)
                .orderReference("REF1")
                .total(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .build();

        Order order2 = Order.builder()
                .user(user)
                .orderReference("REF2")
                .total(new BigDecimal("20.00"))
                .status(OrderStatus.COMPLETED)
                .build();

        orderRepository.save(order1);
        orderRepository.save(order2);

        List<Order> result = orderRepository.findByUserEmailOrderByCreatedAtDesc(user.getEmail());

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getOrderReference()).isEqualTo("REF2");
        assertThat(result.get(1).getOrderReference()).isEqualTo("REF1");
    }

    @Test
    @DisplayName("existsByOrderReference : Vérifie l'existence d'une référence")
    void existsByOrderReference() {
        Order order = Order.builder()
                .user(user)
                .orderReference("UNIQUE")
                .total(new BigDecimal("10.00"))
                .status(OrderStatus.PENDING)
                .build();
        orderRepository.save(order);

        assertThat(orderRepository.existsByOrderReference("UNIQUE")).isTrue();
        assertThat(orderRepository.existsByOrderReference("UNKNOWN")).isFalse();
    }
}
