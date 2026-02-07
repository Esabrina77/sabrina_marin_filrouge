package com.fika.api.features.users;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fika.api.core.dto.PagedResponse;
import com.fika.api.core.exceptions.user.EmailAlreadyExistsException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.users.dto.UserProfileRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
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
    private com.fika.api.core.config.RateLimitFilter rateLimitFilter;

    @MockitoBean
    private com.fika.api.core.exceptions.JwtExceptionHandler jwtExceptionHandler;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private UserRequest userRequest;
    private UserResponse userResponse;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        userRequest = new UserRequest("John", "Doe", "test@example.com", "password123", null);
        userResponse = new UserResponse(userId, "John", "Doe", "test@example.com", Role.CLIENT);
        User user = new User();
        user.setId(userId);
    }

    @Test
    @WithMockUser
    @DisplayName("Create : Création d'un utilisateur")
    void createUser() throws Exception {
        given(userService.createUser(userRequest)).willReturn(userResponse);

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
        given(userService.createUser(userRequest))
                .willThrow(new EmailAlreadyExistsException("L'email test@example.com est déjà utilisé."));

        mockMvc.perform(post("/api/v1/users")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GetAll : Liste tous les utilisateurs (ADMIN)")
    void getAllUsers() throws Exception {
        Page<UserResponse> userPage = new PageImpl<>(List.of(userResponse));
        PagedResponse<UserResponse> pagedResponse = PagedResponse.of(userPage);
        given(userService.getAllUsers(any(Pageable.class))).willReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(userId.toString()))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GetOne : Récupération d'un utilisateur par ID (ADMIN)")
    void getUserById() throws Exception {
        given(userService.getUserById(userId)).willReturn(userResponse);

        mockMvc.perform(get("/api/v1/users/{id}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GetOne : Échec si l'utilisateur n'existe pas (ADMIN)")
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
        given(userService.updateUser(userId, userRequest)).willReturn(userResponse);

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
        given(userService.updateUser(userId, userRequest)).willThrow(new UserNotFoundException(userId));

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
    @DisplayName("GetMe : Récupération de mon profil")
    void getMe() throws Exception {
        given(userService.getCurrentUser(any())).willReturn(userResponse);

        mockMvc.perform(get("/api/v1/users/me")
                .with(authentication(new UsernamePasswordAuthenticationToken(userId, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENT"))))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    @DisplayName("UpdateMe : Mise à jour de mon profil")
    void updateMe() throws Exception {
        UserProfileRequest profileRequest = new UserProfileRequest("John", "Doe", "test@example.com");
        given(userService.updateCurrentUser(any(), any(UserProfileRequest.class))).willReturn(userResponse);

        mockMvc.perform(put("/api/v1/users/me")
                .with(csrf())
                .with(authentication(new UsernamePasswordAuthenticationToken(userId, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENT")))))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    @DisplayName("DeleteMe : Suppression de mon profil")
    void deleteMe() throws Exception {
        mockMvc.perform(delete("/api/v1/users/me")
                .with(csrf())
                .with(authentication(new UsernamePasswordAuthenticationToken(userId, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_CLIENT"))))))
                .andExpect(status().isNoContent());
    }
}
