package com.fika.api.features.auth;

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
import static org.mockito.ArgumentMatchers.eq;
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
        loginResponse = new LoginResponse(userResponse, "Fake-token");
    }

    @Test
    @DisplayName("Login : Succès")
    void loginSuccess() {
        given(userRepository.findByEmail(loginRequest.email())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(loginRequest.password(), user.getPassword())).willReturn(true);
        given(authMapper.toResponse(eq(user), any(String.class))).willReturn(loginResponse);
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
        given(authMapper.toResponse(eq(user), any(String.class))).willReturn(loginResponse);

        LoginResponse result = authService.register(registerRequest);

        assertThat(result).isEqualTo(loginResponse);
    }
}
