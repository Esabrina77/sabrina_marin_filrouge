package com.fika.api.features.orders.dto;

import com.fika.api.features.orders.model.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderReference,
        BigDecimal total,
        OrderStatus status,
        Instant createdAt,
        List<OrderItemResponse> items) {
}
