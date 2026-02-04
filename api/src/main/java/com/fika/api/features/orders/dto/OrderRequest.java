package com.fika.api.features.orders.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record OrderRequest(
        @NotEmpty(message = "La commande doit contenir au moins un article") @Valid List<OrderItemRequest> items) {
}
