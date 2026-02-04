package com.fika.api.features.orders.mapper;

import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.orders.dto.OrderResponse;
import com.fika.api.features.orders.model.Order;
import com.fika.api.features.orders.model.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderMapper {

 private final OrderItemMapper orderItemMapper;

    public OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderReference(),
                order.getTotal(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getItems().stream().map(orderItemMapper::toResponse).toList()
        );
    }
}
