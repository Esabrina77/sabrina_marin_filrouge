package com.fika.api.features.products.dto;

import com.fika.api.features.products.model.Category;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO représentant un produit dans les réponses API.
 */
@Schema(description = "Réponse détaillée d'un produit")
public record ProductResponse(
                @Schema(description = "ID unique du produit", example = "550e8400-e29b-41d4-a716-446655440000") UUID id,
                @Schema(description = "Nom du produit", example = "Espresso") String name,
                @Schema(description = "Prix du produit", example = "2.50") BigDecimal price,
                @Schema(description = "Description détaillée", example = "Un café intense.") String description,
                @Schema(description = "URL de l'image", example = "https://example.com/img.jpg") String imgUrl,
                @Schema(description = "Catégorie", example = "DESSERT") Category category,
                @Schema(description = "Disponibilité", example = "true") boolean available) {
}