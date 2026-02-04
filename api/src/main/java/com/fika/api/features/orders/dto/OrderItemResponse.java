package com.fika.api.features.orders.dto;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO représentant un article d'une commande dans les réponses API.
 */
@Schema(description = "Détail d'un article dans une réponse de commande")
public record OrderItemResponse(
                @Schema(description = "ID technique de la ligne", example = "1") Long id,
                @Schema(description = "ID unique du produit", example = "550e8400-e29b-41d4-a716-446655440000") UUID productId,
                @Schema(description = "Nom du produit", example = "Espresso") String productName,
                @Schema(description = "Quantité commandée", example = "2") Integer quantity,
                @Schema(description = "Prix unitaire au moment de la vente", example = "2.50") BigDecimal priceAtReservation) {
}
