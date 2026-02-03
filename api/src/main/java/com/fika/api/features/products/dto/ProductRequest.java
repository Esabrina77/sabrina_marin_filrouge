package com.fika.api.features.products.dto;

import com.fika.api.features.products.model.Category;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String name,

        @NotNull(message = "Le prix est obligatoire")
        @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
        BigDecimal price,

        @NotBlank(message = "La description est obligatoire")
        @Size(max = 1000)
        String description,

        @NotBlank(message = "L'URL de l'image est obligatoire")
        String imgUrl,

        @NotNull(message = "La catégorie est obligatoire")
        Category category,

        @NotNull(message = "Le statut de disponibilité est obligatoire")
        boolean available
) {
}