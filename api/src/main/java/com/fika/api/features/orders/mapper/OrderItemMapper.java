package com.fika.api.features.orders.mapper;

import com.fika.api.features.orders.dto.OrderItemResponse;
import com.fika.api.features.orders.model.OrderItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class OrderItemMapper {
    public OrderItemResponse toResponse(OrderItem orderItem) {
        return new OrderItemResponse(
                orderItem.getId(),
                orderItem.getProduct().getId(),
                orderItem.getProduct().getName(),
                orderItem.getQuantity(),
                orderItem.getPriceAtReservation()
        );
    }
}


