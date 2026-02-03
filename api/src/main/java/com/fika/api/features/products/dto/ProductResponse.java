package com.fika.api.features.products.dto;

import com.fika.api.features.products.model.Category;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        BigDecimal price,
        String description,
        String imgUrl,
        Category category,
        boolean available
) {
}