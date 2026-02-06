package com.fika.api.integration;

import com.fika.api.features.auth.dto.LoginRequest;
import com.fika.api.features.auth.dto.RegisterRequest;
import com.fika.api.features.orders.dto.OrderItemRequest;
import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.products.dto.ProductRequest;
import com.fika.api.features.products.model.Category;
import com.fika.api.features.products.model.Product;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Intégration : Workflow Commande Complet")
class OrderWorkflowIntegrationTest extends AbstractIntegrationTest {

    private String adminToken;
    private String clientToken;
    private UUID productId;

    @BeforeEach
    void setUp() throws Exception {
        // Le nettoyage est géré par AbstractIntegrationTest.cleanDatabase()

        RegisterRequest adminReg = new RegisterRequest("Admin", "Fika", "admin@fika.com", "AdminPass123");
        mockMvc.perform(post("/api/v1/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminReg)));

        User admin = userRepository.findByEmail("admin@fika.com").orElseThrow();
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        MvcResult adminLogin = mockMvc
                .perform(post("/api/v1/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("admin@fika.com", "AdminPass123"))))
                .andReturn();
        adminToken = com.jayway.jsonpath.JsonPath.read(adminLogin.getResponse().getContentAsString(),
                "$.token");

        RegisterRequest clientReg = new RegisterRequest("Client", "Fika", "client@fika.com", "ClientPass123");
        mockMvc.perform(post("/api/v1/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(clientReg)));

        MvcResult clientLogin = mockMvc
                .perform(post("/api/v1/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("client@fika.com", "ClientPass123"))))
                .andReturn();
        clientToken = com.jayway.jsonpath.JsonPath.read(clientLogin.getResponse().getContentAsString(),
                "$.token");

        ProductRequest prodReq = new ProductRequest("Plat Test", new BigDecimal("10.00"), "Description",
                "http://url",
                Category.PLAT, 10, true);
        MvcResult prodResult = mockMvc.perform(post("/api/v1/products")
                .header("Authorization", "Bearer " + adminToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(prodReq)))
                .andExpect(status().isCreated())
                .andReturn();
        productId = UUID
                .fromString(com.jayway.jsonpath.JsonPath
                        .read(prodResult.getResponse().getContentAsString(), "$.id"));
    }

    @Test
    @DisplayName("Workflow : Création Produit (Admin) -> Commande (Client) -> Vérification Stock")
    void fullOrderWorkflow() throws Exception {
        OrderRequest orderReq = new OrderRequest(List.of(new OrderItemRequest(productId, 3)));

        mockMvc.perform(post("/api/v1/orders")
                .header("Authorization", "Bearer " + clientToken)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated());

        Product updatedProduct = productRepository.findById(productId).orElseThrow();
        assertThat(updatedProduct.getQuantity()).isEqualTo(7);

        assertThat(orderRepository.count()).isEqualTo(1);
    }
}
