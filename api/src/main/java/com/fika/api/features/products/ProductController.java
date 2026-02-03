package com.fika.api.features.products;


import com.fika.api.features.products.dto.ProductRequest;
import com.fika.api.features.products.dto.ProductResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Products", description = "Gestion des produits")
public class ProductController {

    private final ProductService productService;

    @GetMapping()
    @Operation(summary = "Lister les Produits", description = "Récupère les informations des produits sous forme de page.")
    @ApiResponse(responseCode = "200", description = "Liste récupéré")
    public Page<ProductResponse> getAllProducts(@ParameterObject Pageable pageable) {
        return productService.getAllProducts(pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse createProduct(@RequestBody @Valid ProductRequest request) {
        
    }
}
