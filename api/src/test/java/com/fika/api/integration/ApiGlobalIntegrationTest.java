package com.fika.api.integration;

import com.fika.api.features.products.dto.ProductRequest;
import com.fika.api.features.products.model.Category;
import com.fika.api.features.products.model.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Intégration : Logique Globale API")
class ApiGlobalIntegrationTest extends AbstractIntegrationTest {

    private UUID existingProductId;

    @BeforeEach
    void setUp() {
        // Le nettoyage est géré par AbstractIntegrationTest.cleanDatabase()

        Product p = Product.builder()
                .name("Integration Test Product")
                .price(BigDecimal.TEN)
                .description("Desc")
                .imgUrl("http://url.com")
                .category(Category.PLAT)
                .quantity(10)
                .available(true)
                .build();
        existingProductId = productRepository.save(p).getId();
    }

    @Test
    @DisplayName("Général : Accès public au catalogue sans token")
    void publicAccessCatalog() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Sécurité : Un USER ne peut pas modifier un produit (403 Forbidden)")
    void userCannotUpdateProduct() throws Exception {
        ProductRequest request = new ProductRequest("Update", BigDecimal.ONE, "D", "U", Category.PLAT, 5, true);

        mockMvc.perform(put("/api/v1/products/{id}", existingProductId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Validation : Échec de création si quantité négative (400 Bad Request)")
    void adminCannotCreateNegativeQuantity() throws Exception {
        ProductRequest request = new ProductRequest("Fail", BigDecimal.ONE, "D", "U", Category.PLAT, -1, true);

        mockMvc.perform(post("/api/v1/products")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation échouée"))
                .andExpect(jsonPath("$.errors.quantity").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("CRUD : Mise à jour du stock via PATCH")
    void updateStockIntegration() throws Exception {
        mockMvc.perform(patch("/api/v1/products/{id}/stock", existingProductId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"quantity\": 0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(0))
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    @DisplayName("Sécurité : Accès refusé si Token manquant sur route protégée")
    void missingTokenForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Sécurité : Accès refusé si Token invalide")
    void invalidTokenForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                .header("Authorization", "Bearer invalid-token-string"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    @DisplayName("Sécurité : Un CLIENT ne peut pas supprimer un produit")
    void clientCannotDeleteProduct() throws Exception {
        mockMvc.perform(delete("/api/v1/products/{id}", existingProductId)
                .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
