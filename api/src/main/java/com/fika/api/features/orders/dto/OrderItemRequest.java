package com.fika.api.features.orders.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record OrderItemRequest(
        @NotNull(message = "Le produit est obligatoire") UUID productId,
        @NotNull(message = "La quantité est obligatoire") @Min(value = 1, message = "La quantité doit être d'au moins 1") Integer quantity) {
}
