package com.fika.api.features.orders;

import com.fika.api.core.exceptions.order.OrderNotFoundException;
import com.fika.api.core.exceptions.product.ProductNotFoundException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.orders.dto.OrderItemRequest;
import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.orders.dto.OrderResponse;
import com.fika.api.features.orders.mapper.OrderItemMapper;
import com.fika.api.features.orders.mapper.OrderMapper;
import com.fika.api.features.orders.model.Order;
import com.fika.api.features.orders.model.OrderItem;
import com.fika.api.features.orders.model.OrderStatus;
import com.fika.api.features.orders.repository.OrderItemRepository;
import com.fika.api.features.orders.repository.OrderRepository;
import com.fika.api.features.products.ProductRepository;
import com.fika.api.features.products.model.Product;
import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(orderMapper::toResponse).toList();
    }

    public List<OrderResponse> getOrderByUserMail(String email) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(email)
                .stream().map(orderMapper::toResponse).toList();
    }

    public OrderResponse getOrderById(UUID id) {
        return orderRepository.findById(id)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        Order order = Order.builder()
                .user(user)
                .orderReference(generateUniqueReference())
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : orderRequest.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ProductNotFoundException(itemReq.productId().toString()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.quantity())
                    .priceAtReservation(product.getPrice())
                    .build();

            BigDecimal subTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalAmount = totalAmount.add(subTotal);
            order.getItems().add(orderItem);
        }
        order.setTotal(totalAmount);
        Order savedOrder = orderRepository.save(order);
        return orderMapper.toResponse(savedOrder);
    }

    private String generateUniqueReference() {
        String characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder stringBuilder = new StringBuilder();
        Random random = new Random();
        String code;
        do {
            stringBuilder.setLength(0);
            for (int i = 0; i < 4; i++) {
                stringBuilder.append(characters.charAt(random.nextInt(characters.length())));
            }
            code = stringBuilder.toString();
        } while (orderRepository.existsByOrderReference(code));
        return code;
    }

}
