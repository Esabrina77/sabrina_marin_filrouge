package com.fika.api.features.products;


import com.fika.api.features.products.dto.ProductRequest;
import com.fika.api.features.products.dto.ProductResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Gestion du catalogue du café Fika (Menu, inventaire)")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Lister les produits", description = "Récupère tous les produits avec pagination. Accessible à tous.")
    @ApiResponse(responseCode = "200", description = "Liste des produits récupérée avec succès")
    public Page<ProductResponse> getAllProducts(@ParameterObject Pageable pageable) {
        return productService.getAllProducts(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un produit par ID", description = "Fournit les détails d'un produit spécifique. Accessible à tous.")
    @ApiResponse(responseCode = "200", description = "Produit trouvé")
    @ApiResponse(responseCode = "404", description = "Produit non trouvé")
    public ProductResponse getProductById(@PathVariable UUID id) {
        return productService.getProductById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Créer un nouveau produit", description = "Ajoute un produit au catalogue. Réservé aux administrateurs.")
    @ApiResponse(responseCode = "201", description = "Produit créé avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "403", description = "Droits insuffisants (Admin requis)")
    public ProductResponse createProduct(@RequestBody @Valid ProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Modifier un produit existant", description = "Met à jour les informations d'un produit. Réservé aux administrateurs.")
    @ApiResponse(responseCode = "200", description = "Produit mis à jour avec succès")
    @ApiResponse(responseCode = "404", description = "Produit non trouvé")
    public ProductResponse updateProduct(@Parameter(description = "ID unique du produit") @PathVariable UUID id, @Valid @RequestBody ProductRequest productRequest) {
        return productService.updateProduct(productRequest, id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Supprimer un produit", description = "Supprime définitivement un produit du catalogue. Réservé aux administrateurs.")
    @ApiResponse(responseCode = "204", description = "Produit supprimé avec succès")
    @ApiResponse(responseCode = "404", description = "Produit non trouvé")
    public void deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
    }
}
