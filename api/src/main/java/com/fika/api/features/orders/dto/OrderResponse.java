package com.fika.api.features.orders.dto;

import com.fika.api.features.orders.model.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO représentant une commande dans les réponses API.
 */
@Schema(description = "Réponse détaillée d'une commande")
public record OrderResponse(
                @Schema(description = "ID technique", example = "550e8400-e29b-41d4-a716-446655440000") UUID id,
                @Schema(description = "Référence lisible", example = "XJ8K") String orderReference,
                @Schema(description = "Montant total de la commande", example = "12.50") BigDecimal total,
                @Schema(description = "Statut actuel de la commande", example = "PENDING") OrderStatus status,
                @Schema(description = "Date de création") Instant createdAt,
                @Schema(description = "Liste des articles") List<OrderItemResponse> items) {
}
