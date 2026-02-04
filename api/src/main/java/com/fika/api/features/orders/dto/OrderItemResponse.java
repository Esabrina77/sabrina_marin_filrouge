package com.fika.api.features.orders.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        Long id,
        UUID productId,
        String productName,
        Integer quantity,
        BigDecimal priceAtReservation) {
}
