package com.fika.api.features.products;

import tools.jackson.databind.ObjectMapper;
import com.fika.api.core.exceptions.product.ProductNotFoundException;
import com.fika.api.features.products.dto.ProductRequest;
import com.fika.api.features.products.dto.ProductResponse;
import com.fika.api.features.products.model.Category;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Controller : Produits")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private com.fika.api.core.jwt.JwtService jwtService;

    @MockitoBean
    private com.fika.api.core.jwt.JwtFilter jwtFilter;

    @MockitoBean
    private com.fika.api.core.config.RateLimitFilter rateLimitFilter;

    @MockitoBean
    private com.fika.api.core.exceptions.JwtExceptionHandler jwtExceptionHandler;

    @Autowired
    private ObjectMapper objectMapper;

    private ProductRequest productRequest;
    private ProductResponse productResponse;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        productRequest = new ProductRequest(
                "Espresso",
                new BigDecimal("2.00"),
                "Café court",
                "http://img.com/espresso.jpg",
                Category.ENTREE,
                true);
        productResponse = new ProductResponse(
                productId,
                "Espresso",
                new BigDecimal("2.00"),
                "Café court",
                "http://img.com/espresso.jpg",
                Category.ENTREE,
                true);
    }

    @Test
    @WithMockUser
    @DisplayName("GetAll : Liste les produits")
    void getAllProducts() throws Exception {
        Page<ProductResponse> productPage = new PageImpl<>(List.of(productResponse));
        given(productService.getAllProducts(any(Pageable.class))).willReturn(productPage);
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Espresso"));
    }

    @Test
    @WithMockUser
    @DisplayName("GetOne : Récupère un produit par ID")
    void getProductById() throws Exception {
        given(productService.getProductById(productId)).willReturn(productResponse);
        mockMvc.perform(get("/api/v1/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Espresso"));
    }

    @Test
    @WithMockUser
    @DisplayName("GetOne : Erreur si non trouvé")
    void getProductByIdNotFound() throws Exception {
        given(productService.getProductById(productId)).willThrow(new ProductNotFoundException(productId));

        mockMvc.perform(get("/api/v1/products/{id}", productId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Create : Création (Admin)")
    void createProduct() throws Exception {
        given(productService.createProduct(any(ProductRequest.class))).willReturn(productResponse);

        mockMvc.perform(post("/api/v1/products")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Espresso"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Update : Modification (Admin)")
    void updateProduct() throws Exception {
        given(productService.updateProduct(any(ProductRequest.class), eq(productId))).willReturn(productResponse);

        mockMvc.perform(put("/api/v1/products/{id}", productId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Delete : Suppression (Admin)")
    void deleteProduct() throws Exception {
        mockMvc.perform(delete("/api/v1/products/{id}", productId)
                .with(csrf()))
                .andExpect(status().isOk());
    }
}
