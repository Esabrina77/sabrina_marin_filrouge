package com.fika.api.core.exceptions;

import com.fika.api.core.exceptions.handler.JwtExceptionHandler;
import com.fika.api.core.exceptions.product.InsufficientProductQuantityException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.users.UserController;
import com.fika.api.features.users.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Core : Exception Handler")
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private com.fika.api.core.jwt.JwtService jwtService;

    @MockitoBean
    private com.fika.api.core.jwt.JwtFilter jwtFilter;

    @MockitoBean
    private com.fika.api.core.config.RateLimitFilter rateLimitFilter;

    @MockitoBean
    private JwtExceptionHandler jwtExceptionHandler;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Handle UserNotFoundException : Retourne 404 avec format standard")
    void handleUserNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        given(userService.getUserById(id)).willThrow(new UserNotFoundException(id));

        mockMvc.perform(get("/api/v1/users/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Ressource introuvable"))
                .andExpect(jsonPath("$.code").value("resource_not_found"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("Handle InsufficientProductQuantityException : Retourne 400")
    void handleInsufficientQuantity() throws Exception {
        // On simule une erreur qui pourrait arriver sur n'importe quel controller
        // ici on utilise le UserController mocké pour lancer l'exception
        given(userService.getUserById(any())).willThrow(new InsufficientProductQuantityException("Produit", 5, 10));

        mockMvc.perform(get("/api/v1/users/{id}", UUID.randomUUID()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Stock insuffisant"))
                .andExpect(jsonPath("$.code").value("insufficient_stock"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Handle MethodArgumentTypeMismatchException : Retourne 400")
    void handleTypeMismatch() throws Exception {
        mockMvc.perform(get("/api/v1/users/{id}", "invalid-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Format de paramètre invalide"))
                .andExpect(jsonPath("$.code").value("malformed_request"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Handle HttpMessageNotReadableException : Retourne 400")
    void handleMalformedJson() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/users")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content("{ invalid json }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Requête malformée"))
                .andExpect(jsonPath("$.code").value("malformed_request"));
    }
}
