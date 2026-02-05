package com.fika.api.features.orders;

import com.fika.api.core.dto.PagedResponse;
import com.fika.api.core.exceptions.order.OrderNotFoundException;
import com.fika.api.core.exceptions.product.ProductNotFoundException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.orders.dto.OrderItemRequest;
import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.orders.dto.OrderResponse;
import com.fika.api.features.orders.mapper.OrderMapper;
import com.fika.api.features.orders.model.Order;
import com.fika.api.features.orders.model.OrderStatus;
import com.fika.api.features.orders.repository.OrderRepository;
import com.fika.api.features.products.ProductRepository;
import com.fika.api.features.products.model.Product;
import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service : Gestion des commandes")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private Product product;
    private Order order;
    private OrderResponse orderResponse;
    private UUID orderId;
    private String userEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        user = new User();
        user.setEmail(userEmail);

        product = Product.builder()
                .id(UUID.randomUUID())
                .name("Café")
                .price(new BigDecimal("2.50"))
                .build();

        order = Order.builder()
                .id(orderId)
                .user(user)
                .orderReference("ABCD")
                .status(OrderStatus.PENDING)
                .total(new BigDecimal("2.50"))
                .items(new ArrayList<>())
                .build();

        orderResponse = new OrderResponse(orderId, "ABCD", new BigDecimal("2.50"), OrderStatus.PENDING, null, null);
    }

    @Test
    @DisplayName("GetAll : Retourne toutes les commandes")
    void getAllOrders() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> orderPage = new PageImpl<>(List.of(order));
        given(orderRepository.findAllByOrderByCreatedAtDesc(pageable)).willReturn(orderPage);
        given(orderMapper.toResponse(order)).willReturn(orderResponse);

        PagedResponse<OrderResponse> result = orderService.getAllOrders(pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0)).isEqualTo(orderResponse);
    }

    @Test
    @DisplayName("GetByUser : Retourne les commandes d'un utilisateur")
    void getOrderByUserMail() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> orderPage = new PageImpl<>(List.of(order));
        given(orderRepository.findByUserEmailOrderByCreatedAtDesc(eq(userEmail), eq(pageable))).willReturn(orderPage);
        given(orderMapper.toResponse(order)).willReturn(orderResponse);

        PagedResponse<OrderResponse> result = orderService.getOrderByUserMail(userEmail, pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0)).isEqualTo(orderResponse);
    }

    @Test
    @DisplayName("GetById : Succès si propriétaire")
    void getOrderByIdSuccessOwner() {
        given(orderRepository.findById(orderId)).willReturn(Optional.of(order));
        given(orderMapper.toResponse(order)).willReturn(orderResponse);

        OrderResponse result = orderService.getOrderById(orderId, userEmail, false);

        assertThat(result).isEqualTo(orderResponse);
    }

    @Test
    @DisplayName("GetById : Succès si admin")
    void getOrderByIdSuccessAdmin() {
        given(orderRepository.findById(orderId)).willReturn(Optional.of(order));
        given(orderMapper.toResponse(order)).willReturn(orderResponse);

        OrderResponse result = orderService.getOrderById(orderId, "admin@example.com", true);

        assertThat(result).isEqualTo(orderResponse);
    }

    @Test
    @DisplayName("GetById : Erreur si non autorisé")
    void getOrderByIdAccessDenied() {
        given(orderRepository.findById(orderId)).willReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.getOrderById(orderId, "other@example.com", false))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("GetById : Erreur si commande introuvable")
    void getOrderByIdNotFound() {
        given(orderRepository.findById(orderId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderById(orderId, userEmail, true))
                .isInstanceOf(OrderNotFoundException.class);
    }

    @Test
    @DisplayName("Create : Création d'une commande avec succès")
    void createOrderSuccess() {
        OrderItemRequest itemRequest = new OrderItemRequest(product.getId(), 2);
        OrderRequest orderRequest = new OrderRequest(List.of(itemRequest));

        given(userRepository.findByEmail(userEmail)).willReturn(Optional.of(user));
        given(productRepository.findById(product.getId())).willReturn(Optional.of(product));
        given(orderRepository.existsByOrderReference(anyString())).willReturn(false);
        given(orderRepository.saveAndFlush(any(Order.class))).willReturn(order);
        given(orderMapper.toResponse(any(Order.class))).willReturn(orderResponse);

        OrderResponse result = orderService.createOrder(orderRequest, userEmail);

        assertThat(result).isEqualTo(orderResponse);
        verify(orderRepository).saveAndFlush(any(Order.class));
    }

    @Test
    @DisplayName("Create : Erreur si produit introuvable")
    void createOrderProductNotFound() {
        OrderItemRequest itemRequest = new OrderItemRequest(product.getId(), 2);
        OrderRequest orderRequest = new OrderRequest(List.of(itemRequest));

        given(userRepository.findByEmail(userEmail)).willReturn(Optional.of(user));
        given(productRepository.findById(product.getId())).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(orderRequest, userEmail))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    @DisplayName("Create : Erreur si utilisateur introuvable")
    void createOrderUserNotFound() {
        OrderRequest orderRequest = new OrderRequest(List.of());

        given(userRepository.findByEmail(userEmail)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(orderRequest, userEmail))
                .isInstanceOf(UserNotFoundException.class);
    }
}
