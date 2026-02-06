package com.fika.api.integration;

import com.fika.api.features.auth.dto.LoginRequest;
import com.fika.api.features.auth.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Intégration : Authentification Lifecycle")
class AuthIntegrationTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("Lifecycle : Inscription -> Login -> Accès protégé")
    void fullAuthLifecycle() throws Exception {
        // 1. Inscription
        RegisterRequest registerRequest = new RegisterRequest("Marie", "Curie", "marie@fika.com", "SecurePassword123");
        mockMvc.perform(post("/api/v1/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        // 2. Login
        LoginRequest loginRequest = new LoginRequest("marie@fika.com", "SecurePassword123");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String token = com.jayway.jsonpath.JsonPath.read(loginResult.getResponse().getContentAsString(), "$.token");

        // 3. Accès protégé avec le token
        mockMvc.perform(get("/api/v1/users/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("marie@fika.com"));
    }

    @Test
    @DisplayName("Login : Échec avec mauvais mot de passe")
    void loginFailure() throws Exception {
        // Inscription préalable
        RegisterRequest registerRequest = new RegisterRequest("Marie", "Curie", "marie@fika.com", "SecurePassword123");
        mockMvc.perform(post("/api/v1/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        // Login raté
        LoginRequest loginRequest = new LoginRequest("marie@fika.com", "WrongPassword");
        mockMvc.perform(post("/api/v1/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
