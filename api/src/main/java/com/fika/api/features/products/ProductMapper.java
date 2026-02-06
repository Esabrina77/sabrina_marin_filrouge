package com.fika.api.features.products;

import com.fika.api.features.products.dto.ProductRequest;
import com.fika.api.features.products.dto.ProductResponse;
import com.fika.api.features.products.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {
    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getImgUrl(),
                product.getCategory(),
                product.getQuantity(),
                product.isAvailable());
    }

    public Product toEntity(ProductRequest productRequest) {
        if (productRequest == null)
            return null;
        return Product.builder()
                .name(productRequest.name())
                .price(productRequest.price())
                .description(productRequest.description())
                .imgUrl(productRequest.imgUrl())
                .category(productRequest.category())
                .quantity(productRequest.quantity())
                .available(productRequest.available())
                .build();
    }
}
