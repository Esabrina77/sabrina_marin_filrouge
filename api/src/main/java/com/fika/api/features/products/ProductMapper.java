package com.fika.api.features.products;


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
                product.isAvailable()
        );
    }
}
