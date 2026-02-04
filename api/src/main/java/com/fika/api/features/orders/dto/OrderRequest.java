package com.fika.api.features.orders.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO pour la création d'une nouvelle commande.
 */
@Schema(description = "Requête de création de commande")
public record OrderRequest(
                @NotEmpty(message = "La commande doit contenir au moins un article") @Valid @Schema(description = "Liste des articles de la commande") List<OrderItemRequest> items) {
}
