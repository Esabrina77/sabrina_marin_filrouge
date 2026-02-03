package com.fika.api.features.users;

import tools.jackson.databind.ObjectMapper;
import com.fika.api.core.exceptions.user.EmailAlreadyExistsException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
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

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Controller : Gestion des utilisateurs")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private com.fika.api.core.jwt.JwtService jwtService;

    @MockitoBean
    private com.fika.api.core.jwt.JwtFilter jwtFilter;

    @MockitoBean
    private com.fika.api.core.exceptions.JwtExceptionHandler jwtExceptionHandler;

    @Autowired
    private ObjectMapper objectMapper;

    private UserRequest userRequest;
    private UserResponse userResponse;
    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        userRequest = new UserRequest("John", "Doe", "test@example.com", "password123", null);
        userResponse = new UserResponse(userId, "John", "Doe", "test@example.com", Role.CLIENT);

        user = new User();
        user.setId(userId);
    }

    @Test
    @WithMockUser
    @DisplayName("Create : Création d'un utilisateur")
    void createUser() throws Exception {
        given(userService.createUser(any(UserRequest.class))).willReturn(userResponse);

        mockMvc.perform(post("/api/v1/users")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @WithMockUser
    @DisplayName("Create : Échec si l'email existe déjà")
    void createUserFailEmailExists() throws Exception {
        given(userService.createUser(any(UserRequest.class)))
                .willThrow(new EmailAlreadyExistsException("L'email test@example.com est déjà utilisé."));

        mockMvc.perform(post("/api/v1/users")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @WithMockUser
    @DisplayName("GetAll : Liste tous les utilisateurs")
    void getAllUsers() throws Exception {
        given(userService.getAllUsers()).willReturn(List.of(userResponse));

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(userId.toString()));
    }

    @Test
    @WithMockUser
    @DisplayName("GetOne : Récupération d'un utilisateur par ID")
    void getUserById() throws Exception {
        given(userService.getUserById(userId)).willReturn(userResponse);

        mockMvc.perform(get("/api/v1/users/{id}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()));
    }

    @Test
    @WithMockUser
    @DisplayName("GetOne : Échec si l'utilisateur n'existe pas")
    void getUserByIdNotFound() throws Exception {
        given(userService.getUserById(userId)).willThrow(new UserNotFoundException(userId));

        mockMvc.perform(get("/api/v1/users/{id}", userId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @WithMockUser
    @DisplayName("Update : Mise à jour d'un utilisateur")
    void updateUser() throws Exception {
        given(userService.updateUser(eq(userId), any(UserRequest.class))).willReturn(userResponse);

        mockMvc.perform(put("/api/v1/users/{id}", userId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    @WithMockUser
    @DisplayName("Update : Échec si l'utilisateur n'existe pas")
    void updateUserNotFound() throws Exception {
        given(userService.updateUser(eq(userId), any(UserRequest.class))).willThrow(new UserNotFoundException(userId));

        mockMvc.perform(put("/api/v1/users/{id}", userId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("Delete : Supprimer un utilisateur")
    void deleteUser() throws Exception {
        mockMvc.perform(delete("/api/v1/users/{id}", userId)
                .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    @DisplayName("Delete : Échec si l'utilisateur n'existe pas")
    void deleteUserNotFound() throws Exception {
        org.mockito.BDDMockito.willThrow(new UserNotFoundException(userId)).given(userService).deleteUser(userId);

        mockMvc.perform(delete("/api/v1/users/{id}", userId)
                .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("GetMe : Récupération de mon profil")
    void getMe() throws Exception {
        given(userService.getCurrentUser("test@example.com")).willReturn(userResponse);

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }
}
