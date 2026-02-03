package com.fika.api.features.auth;

import com.fika.api.core.jwt.JwtService;
import com.fika.api.features.auth.dto.LoginRequest;
import com.fika.api.features.auth.dto.LoginResponse;
import com.fika.api.features.auth.dto.RegisterRequest;
import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.UserService;
import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service : Authentification")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthMapper authMapper;

    @Mock
    private UserService userService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User user;
    private UserResponse userResponse;
    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;
    private LoginResponse loginResponse;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setFirstName("John");
        user.setLastName("Doe");

        loginRequest = new LoginRequest("test@example.com", "password123");
        registerRequest = new RegisterRequest("John", "Doe", "test@example.com", "password123");
        userResponse = new UserResponse(UUID.randomUUID(), "John", "Doe", "test@example.com", Role.CLIENT);
        loginResponse = new LoginResponse(userResponse, "Fake-token", "Fake-refresh-token");
    }

    @Test
    @DisplayName("Login : Succès")
    void loginSuccess() {
        given(userRepository.findByEmail(loginRequest.email())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(loginRequest.password(), user.getPassword())).willReturn(true);
        given(jwtService.generateToken(any())).willReturn("Fake-token");
        com.fika.api.features.auth.model.RefreshToken rt = new com.fika.api.features.auth.model.RefreshToken();
        rt.setToken("Fake-refresh-token");
        given(refreshTokenService.createRefreshToken(any())).willReturn(rt);
        given(authMapper.toResponse(user, "Fake-token", "Fake-refresh-token")).willReturn(loginResponse);

        LoginResponse result = authService.login(loginRequest);
        assertThat(result).isEqualTo(loginResponse);
    }

    @Test
    @DisplayName("Login : Échec (utilisateur non trouvé)")
    void loginFailUserNotFound() {
        given(userRepository.findByEmail(loginRequest.email())).willReturn(Optional.empty());
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Email ou mot de passe incorrect");
    }

    @Test
    @DisplayName("Login : Échec (mot de passe incorrect)")
    void loginFailInvalidPassword() {
        given(userRepository.findByEmail(loginRequest.email())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(loginRequest.password(), user.getPassword())).willReturn(false);
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Email ou mot de passe incorrect");
    }

    @Test
    @DisplayName("Register : Succès")
    void registerSuccess() {
        given(userService.createUser(any(UserRequest.class))).willReturn(userResponse);
        given(userRepository.findByEmail(userResponse.email())).willReturn(Optional.of(user));
        given(jwtService.generateToken(any())).willReturn("Fake-token");
        com.fika.api.features.auth.model.RefreshToken rt = new com.fika.api.features.auth.model.RefreshToken();
        rt.setToken("Fake-refresh-token");
        given(refreshTokenService.createRefreshToken(any())).willReturn(rt);
        given(authMapper.toResponse(user, "Fake-token", "Fake-refresh-token")).willReturn(loginResponse);

        LoginResponse result = authService.register(registerRequest);

        assertThat(result).isEqualTo(loginResponse);
    }

    @Test
    @DisplayName("RefreshToken : Succès")
    void refreshTokenSuccess() {
        String oldRefreshToken = "Fake-refresh-token";
        com.fika.api.features.auth.dto.TokenRefreshRequest request = new com.fika.api.features.auth.dto.TokenRefreshRequest(
                oldRefreshToken);

        com.fika.api.features.auth.model.RefreshToken rt = new com.fika.api.features.auth.model.RefreshToken();
        rt.setToken(oldRefreshToken);
        rt.setUser(user);

        com.fika.api.features.auth.model.RefreshToken newRt = new com.fika.api.features.auth.model.RefreshToken();
        newRt.setToken("New-refresh-token");

        given(refreshTokenService.findByToken(oldRefreshToken)).willReturn(Optional.of(rt));
        given(refreshTokenService.verifyExpiration(rt)).willReturn(rt);
        given(jwtService.generateToken(user)).willReturn("New-access-token");
        given(refreshTokenService.createRefreshToken(user)).willReturn(newRt);

        com.fika.api.features.auth.dto.TokenRefreshResponse result = authService.refreshToken(request);

        assertThat(result.accessToken()).isEqualTo("New-access-token");
        assertThat(result.refreshToken()).isEqualTo("New-refresh-token");
    }

    @Test
    @DisplayName("RefreshToken : Échec (jeton introuvable)")
    void refreshTokenFailNotFound() {
        String token = "invalid-token";
        com.fika.api.features.auth.dto.TokenRefreshRequest request = new com.fika.api.features.auth.dto.TokenRefreshRequest(
                token);

        given(refreshTokenService.findByToken(token)).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refreshToken(request))
                .isInstanceOf(com.fika.api.core.exceptions.auth.RefreshTokenNotFoundException.class);
    }
}
