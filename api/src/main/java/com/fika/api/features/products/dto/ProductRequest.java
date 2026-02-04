package com.fika.api.features.products.dto;

import com.fika.api.features.products.model.Category;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Schema(description = "Requête de création ou modification d'un produit")
public record ProductRequest(
        @NotBlank(message = "Le nom est obligatoire")
        @Schema(example = "Kanelbullar Maison")
        String name,

        @NotNull(message = "Le prix est obligatoire")
        @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
        @Schema(example = "4.50")
        BigDecimal price,

        @NotBlank(message = "La description est obligatoire")
        @Size(max = 1000)
        @Schema(example = "L'authentique brioche suédoise à la cannelle et cardamome. Moelleuse à souhait !")
        String description,

        @NotBlank(message = "L'URL de l'image est obligatoire")
        @Schema(example = "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1000&auto=format&fit=crop")
        String imgUrl,

        @NotNull(message = "La catégorie est obligatoire")
        @Schema(example = "DESSERT")
        Category category,

        @NotNull(message = "Le statut de disponibilité est obligatoire")
        @Schema(example = "true")
        boolean available
) {
}