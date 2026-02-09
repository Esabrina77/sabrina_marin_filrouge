package com.fika.api.features.products;

import com.fika.api.core.dto.PagedResponse;
import com.fika.api.core.exceptions.product.ProductNotFoundException;
import com.fika.api.features.products.dto.ProductRequest;
import com.fika.api.features.products.dto.ProductResponse;
import com.fika.api.features.products.model.Allergen;
import com.fika.api.features.products.model.Category;
import com.fika.api.features.products.model.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service : Produits")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private ProductRequest productRequest;
    private ProductResponse productResponse;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        product = Product.builder()
                .id(productId)
                .name("Café Noir")
                .price(new BigDecimal("2.50"))
                .description("Un café noir intense")
                .imgUrl("http://example.com/cafe.jpg")
                .category(Category.ENTREE)
                .allergen(Allergen.GLUTEN)
                .quantity(10)
                .available(true)
                .build();

        productRequest = new ProductRequest(
                "Café Noir",
                new BigDecimal("2.50"),
                "Un café noir intense",
                "http://example.com/cafe.jpg",
                Category.ENTREE,
                Allergen.GLUTEN,
                10,
                true);

        productResponse = new ProductResponse(
                productId,
                "Café Noir",
                new BigDecimal("2.50"),
                "Un café noir intense",
                "http://example.com/cafe.jpg",
                Category.ENTREE,
                Allergen.GLUTEN,
                10,
                true);
    }

    @Test
    @DisplayName("Catalogue : Récupération avec succès")
    void getAllProductsSuccess() {
        Pageable pageable = PageRequest.of(0, 12);
        Page<Product> productPage = new PageImpl<>(List.of(product), pageable, 1);

        given(productRepository.findWithFilters(anyString(), any(), any(), any(), any(), any(), eq(pageable)))
                .willReturn(productPage);
        given(productMapper.toResponse(any(Product.class))).willReturn(productResponse);

        PagedResponse<ProductResponse> response = productService.getAllProducts("Test", Category.PLAT, Allergen.GLUTEN,
                null, null, null, pageable);

        assertThat(response.content()).hasSize(1);
        assertThat(response.content().getFirst()).isEqualTo(productResponse);
        assertThat(response.pageNumber()).isZero();
        assertThat(response.pageSize()).isEqualTo(12);
    }

    @Test
    @DisplayName("Récupérer par ID : Succès")
    void getProductByIdSuccess() {
        given(productRepository.findById(productId)).willReturn(Optional.of(product));
        given(productMapper.toResponse(product)).willReturn(productResponse);
        ProductResponse result = productService.getProductById(productId);
        assertThat(result).isEqualTo(productResponse);
    }

    @Test
    @DisplayName("Récupérer par ID : Échec (non trouvé)")
    void getProductByIdFail() {
        given(productRepository.findById(productId)).willReturn(Optional.empty());
        assertThatThrownBy(() -> productService.getProductById(productId))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    @DisplayName("Créer un produit : Succès")
    void createProductSuccess() {
        given(productMapper.toEntity(productRequest)).willReturn(product);
        given(productRepository.save(product)).willReturn(product);
        given(productMapper.toResponse(product)).willReturn(productResponse);
        ProductResponse result = productService.createProduct(productRequest);
        assertThat(result).isEqualTo(productResponse);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Mettre à jour un produit : Succès")
    void updateProductSuccess() {
        given(productRepository.findById(productId)).willReturn(Optional.of(product));
        given(productRepository.save(product)).willReturn(product);
        given(productMapper.toResponse(product)).willReturn(productResponse);
        ProductResponse result = productService.updateProduct(productRequest, productId);
        assertThat(result).isEqualTo(productResponse);
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("Supprimer un produit : Succès")
    void deleteProductSuccess() {
        given(productRepository.existsById(productId)).willReturn(true);
        productService.deleteProduct(productId);
        verify(productRepository).deleteById(productId);
    }

    @Test
    @DisplayName("Supprimer un produit : Échec (non trouvé)")
    void deleteProductFail() {
        given(productRepository.existsById(productId)).willReturn(false);
        assertThatThrownBy(() -> productService.deleteProduct(productId))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    @DisplayName("Mettre à jour le stock : Succès")
    void updateStockSuccess() {
        int newQuantity = 50;
        given(productRepository.findById(productId)).willReturn(Optional.of(product));
        given(productRepository.save(product)).willReturn(product);
        given(productMapper.toResponse(product)).willReturn(new ProductResponse(productId, "Café Noir",
                new BigDecimal("2.50"), "Description", "url", Category.ENTREE, Allergen.GLUTEN, newQuantity, true));

        productService.updateStock(productId, newQuantity);

        assertThat(product.getQuantity()).isEqualTo(newQuantity);
        assertThat(product.isAvailable()).isTrue();
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("Mettre à jour le stock : Succès (épuisé)")
    void updateStockOutOfStock() {
        int newQuantity = 0;
        given(productRepository.findById(productId)).willReturn(Optional.of(product));
        given(productRepository.save(product)).willReturn(product);
        given(productMapper.toResponse(product)).willReturn(new ProductResponse(productId, "Café Noir",
                new BigDecimal("2.50"), "Description", "url", Category.ENTREE, Allergen.GLUTEN, newQuantity, false));

        productService.updateStock(productId, newQuantity);

        assertThat(product.getQuantity()).isZero();
        assertThat(product.isAvailable()).isFalse();
        verify(productRepository).save(product);
    }
}
