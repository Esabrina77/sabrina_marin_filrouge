package com.fika.api.core.exceptions;

import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.users.UserController;
import com.fika.api.features.users.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

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
    private com.fika.api.core.exceptions.JwtExceptionHandler jwtExceptionHandler;

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
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
