package com.fika.api.features.users;

import com.fika.api.core.exceptions.user.EmailAlreadyExistsException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service : Gestion des utilisateurs")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserRequest userRequest;
    private UserResponse userResponse;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setFirstName("John");
        user.setLastName("Doe");

        userRequest = new UserRequest("John", "Doe", "test@example.com", "password123", null);
        userResponse = new UserResponse(userId, "John", "Doe", "test@example.com", Role.CLIENT);
    }

    @Test
    @DisplayName("GetAll : Retourne la liste des utilisateurs")
    void getAllUsers() {
        given(userRepository.findAll()).willReturn(List.of(user));
        given(userMapper.toResponse(user)).willReturn(userResponse);
        List<UserResponse> result = userService.getAllUsers();
        assertThat(result).hasSize(1);
        assertThat(result.getFirst()).isEqualTo(userResponse);
        then(userRepository).should().findAll();
    }

    @Test
    @DisplayName("GetOne : Succès si l'utilisateur existe")
    void getUserByIdSuccess() {
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(userMapper.toResponse(user)).willReturn(userResponse);
        UserResponse result = userService.getUserById(userId);
        assertThat(result).isEqualTo(userResponse);
    }

    @Test
    @DisplayName("GetOne : Erreur si l'utilisateur n'existe pas")
    void getUserByIdNotFound() {
        given(userRepository.findById(userId)).willReturn(Optional.empty());
        assertThatThrownBy(() -> userService.getUserById(userId))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining(userId.toString());
    }

    @Test
    @DisplayName("Create : Succès si l'email est unique")
    void createUserSuccess() {
        given(userRepository.existsByEmail(userRequest.email())).willReturn(false);
        given(userMapper.toEntity(userRequest)).willReturn(user);
        given(passwordEncoder.encode(userRequest.password())).willReturn("encodedPassword");
        given(userRepository.save(user)).willReturn(user);
        given(userMapper.toResponse(user)).willReturn(userResponse);

        UserResponse result = userService.createUser(userRequest);

        assertThat(result).isEqualTo(userResponse);
        then(userRepository).should().save(user);
    }

    @Test
    @DisplayName("Create : Erreur si l'email existe déjà")
    void createUserEmailExists() {
        given(userRepository.existsByEmail(userRequest.email())).willReturn(true);
        assertThatThrownBy(() -> userService.createUser(userRequest))
                .isInstanceOf(EmailAlreadyExistsException.class);
        then(userRepository).should(never()).save(any());
    }

    @Test
    @DisplayName("Update : Succès")
    void updateUserSuccess() {
        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(userRepository.save(user)).willReturn(user);
        given(userMapper.toResponse(user)).willReturn(userResponse);
        given(passwordEncoder.encode(userRequest.password())).willReturn("newEncodedPassword");
        UserResponse result = userService.updateUser(userId, userRequest);
        assertThat(result).isEqualTo(userResponse);
        then(userRepository).should().save(user);
    }

    @Test
    @DisplayName("Update : Erreur si l'utilisateur n'existe pas")
    void updateUserNotFound() {
        given(userRepository.findById(userId)).willReturn(Optional.empty());
        assertThatThrownBy(() -> userService.updateUser(userId, userRequest))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    @DisplayName("Delete : Succès si l'utilisateur existe")
    void deleteUserSuccess() {
        given(userRepository.existsById(userId)).willReturn(true);
        userService.deleteUser(userId);
        then(userRepository).should().deleteById(userId);
    }

    @Test
    @DisplayName("Delete : Erreur si l'utilisateur n'existe pas")
    void deleteUserNotFound() {
        given(userRepository.existsById(userId)).willReturn(false);
        assertThatThrownBy(() -> userService.deleteUser(userId))
                .isInstanceOf(UserNotFoundException.class);
    }
}
