package com.fika.api.features.auth;

import com.fika.api.features.auth.dto.*;
import org.springframework.http.ResponseCookie;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
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

import java.util.UUID;

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

        @MockitoBean
        private com.fika.api.core.utils.CookieUtil cookieUtil;

        @Autowired
        private ObjectMapper objectMapper;

        private LoginRequest loginRequest;
        private RegisterRequest registerRequest;
        private LoginResponse loginResponse;

        @BeforeEach
        void setUp() {
                loginRequest = new LoginRequest("test@example.com", "password123");
                registerRequest = new RegisterRequest("John", "Doe", "test@example.com", "password123");
                UserResponse userResponse = new UserResponse(UUID.randomUUID(), "John", "Doe", "test@example.com",
                                Role.CLIENT);
                loginResponse = new LoginResponse(userResponse, "Fake-token", "Fake-refresh-token");
        }

        @Test
        @WithMockUser
        @DisplayName("Login : Succès avec identifiants valides")
        void loginSuccess() throws Exception {
                given(authService.login(any(LoginRequest.class))).willReturn(loginResponse);
                given(cookieUtil.createRefreshTokenCookie(any())).willReturn(
                                ResponseCookie.from("refreshToken", "Fake-refresh-token").httpOnly(true).build());

                mockMvc.perform(post("/api/v1/auth/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andExpect(status().isOk())
                                .andExpect(MockMvcResultMatchers.cookie().doesNotExist("accessToken")) // Plus de cookie
                                                                                                       // accessToken
                                .andExpect(MockMvcResultMatchers.cookie().exists("refreshToken"))
                                .andExpect(jsonPath("$.user.email").value("test@example.com"))
                                .andExpect(jsonPath("$.token").value("Fake-token")); // Access Token dans le JSON
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
                                .andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect."));
        }

        @Test
        @WithMockUser
        @DisplayName("Register : Succès de la création de compte")
        void registerSuccess() throws Exception {
                given(authService.register(any(RegisterRequest.class))).willReturn(loginResponse);
                given(cookieUtil.createRefreshTokenCookie(any())).willReturn(
                                ResponseCookie.from("refreshToken", "Fake-refresh-token").httpOnly(true).build());

                mockMvc.perform(post("/api/v1/auth/register")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerRequest)))
                                .andExpect(status().isCreated())
                                .andExpect(MockMvcResultMatchers.cookie().doesNotExist("accessToken"))
                                .andExpect(MockMvcResultMatchers.cookie().exists("refreshToken"))
                                .andExpect(jsonPath("$.user.email").value("test@example.com"))
                                .andExpect(jsonPath("$.token").value("Fake-token"));
        }

        @Test
        @WithMockUser
        @DisplayName("RefreshToken : Succès du renouvellement de token")
        void refreshTokenSuccess() throws Exception {
                TokenRefreshResponse refreshResponse = new TokenRefreshResponse("New-Fake-token", "Fake-refresh-token");
                given(authService.refreshToken(any(TokenRefreshRequest.class))).willReturn(refreshResponse);
                given(cookieUtil.createRefreshTokenCookie(any())).willReturn(
                                ResponseCookie.from("refreshToken", "Fake-refresh-token").httpOnly(true).build());

                mockMvc.perform(post("/api/v1/auth/refresh-token")
                                .with(csrf())
                                .cookie(new jakarta.servlet.http.Cookie("refreshToken", "Fake-refresh-token")))
                                .andExpect(status().isOk())
                                .andExpect(MockMvcResultMatchers.cookie().doesNotExist("accessToken"))
                                .andExpect(MockMvcResultMatchers.cookie().exists("refreshToken"))
                                .andExpect(jsonPath("$.accessToken").value("New-Fake-token"));
        }

        @Test
        @WithMockUser
        @DisplayName("Logout : Succès de la déconnexion")
        void logoutSuccess() throws Exception {
                given(cookieUtil.deleteRefreshTokenCookie())
                                .willReturn(ResponseCookie.from("refreshToken", "").maxAge(0).build());

                mockMvc.perform(post("/api/v1/auth/logout")
                                .with(csrf())
                                .cookie(new jakarta.servlet.http.Cookie("refreshToken", "Fake-refresh-token")))
                                .andExpect(status().isNoContent())
                                .andExpect(MockMvcResultMatchers.cookie().maxAge("refreshToken", 0));
        }
}
