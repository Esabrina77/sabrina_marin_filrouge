package com.fika.api.features.orders.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO pour un article dans une requête de commande.
 */
@Schema(description = "Détail d'un article pour une commande")
public record OrderItemRequest(
                @NotNull(message = "Le produit est obligatoire") @Schema(description = "ID unique du produit", example = "550e8400-e29b-41d4-a716-446655440000") UUID productId,

                @NotNull(message = "La quantité est obligatoire") @Min(value = 1, message = "La quantité doit être d'au moins 1") @Schema(description = "Quantité désirée", example = "2") Integer quantity) {
}
