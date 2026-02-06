package com.fika.api.features.products.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO pour la mise à jour partielle du stock d'un produit.
 */
@Schema(description = "Requête de mise à jour du stock")
public record StockUpdateRequest(
        @NotNull(message = "La quantité est obligatoire") @Min(value = 0, message = "La quantité ne peut pas être négative") @Schema(description = "Nouvelle quantité en stock", example = "50") int quantity) {
}
