package com.fika.api.features.auth;

import com.fika.api.features.auth.dto.*;
import tools.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.BadCredentialsException;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.features.users.model.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Controller : Authentification")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private com.fika.api.core.jwt.JwtService jwtService;

    @MockitoBean
    private com.fika.api.core.jwt.JwtFilter jwtFilter;

    @MockitoBean
    private com.fika.api.core.exceptions.JwtExceptionHandler jwtExceptionHandler;

    @Autowired
    private ObjectMapper objectMapper;

    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;
    private LoginResponse loginResponse;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest("test@example.com", "password123");
        registerRequest = new RegisterRequest("John", "Doe", "test@example.com", "password123");
        UserResponse userResponse = new UserResponse(java.util.UUID.randomUUID(), "John", "Doe", "test@example.com", Role.CLIENT);
        loginResponse = new LoginResponse(userResponse, "Fake-token", "Fake-refresh-token");
    }

    @Test
    @WithMockUser
    @DisplayName("Login : Succès avec identifiants valides")
    void loginSuccess() throws Exception {
        given(authService.login(any(LoginRequest.class))).willReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("Fake-token"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"));
    }

    @Test
    @WithMockUser
    @DisplayName("Login : Échec avec identifiants invalides")
    void loginFail() throws Exception {
        given(authService.login(any(LoginRequest.class)))
                .willThrow(new BadCredentialsException("Email ou mot de passe incorrect"));
        mockMvc.perform(post("/api/v1/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect"));
    }

    @Test
    @WithMockUser
    @DisplayName("Register : Succès de la création de compte")
    void registerSuccess() throws Exception {
        given(authService.register(any(RegisterRequest.class))).willReturn(loginResponse);
        mockMvc.perform(post("/api/v1/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("Fake-token"))
                .andExpect(jsonPath("$.user.email").value("test@example.com"));
    }

    @Test
    @WithMockUser
    @DisplayName("RefreshToken : Succès du renouvellement de token")
    void refreshTokenSuccess() throws Exception {
        TokenRefreshRequest refreshRequest = new TokenRefreshRequest("Fake-refresh-token");
        TokenRefreshResponse refreshResponse = new TokenRefreshResponse("New-Fake-token", "Fake-refresh-token");
        given(authService.refreshToken(any(com.fika.api.features.auth.dto.TokenRefreshRequest.class))).willReturn(refreshResponse);
        mockMvc.perform(post("/api/v1/auth/refresh-token")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("New-Fake-token"))
                .andExpect(jsonPath("$.refreshToken").value("Fake-refresh-token"));
    }
}
