package com.fika.api.features.users;

import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur REST pour la gestion des utilisateurs (API v1).
 * <p>
 * Ce point d'entrée permet de gérer le cycle de vie complet des utilisateurs :
 * création, consultation, mise à jour et suppression (CRUD).
 * Toutes les routes sont préfixées par /api/v1/users.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Crée un nouvel utilisateur dans le système.
     *
     * @param userRequest DTO contenant les informations de l'utilisateur (validé par @Valid).
     * @return UserResponse contenant les données de l'utilisateur créé.
     * @status 201 Created
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody UserRequest userRequest) {
        return userService.createUser(userRequest);
    }

    /**
     * Récupère la liste exhaustive de tous les utilisateurs enregistrés.
     *
     * @return Liste de UserResponse.
     * @status 200 OK
     */
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * Récupère les détails d'un utilisateur spécifique par son identifiant unique.
     *
     * @param id Identifiant UUID de l'utilisateur.
     * @return UserResponse de l'utilisateur trouvé.
     * @status 200 OK ou 404 Not Found (via GlobalExceptionHandler)
     */
    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    /**
     * Met à jour l'intégralité des informations d'un utilisateur.
     *
     * @param id          Identifiant UUID de l'utilisateur à modifier.
     * @param userRequest Nouvelles données de l'utilisateur (validées par @Valid).
     * @return UserResponse de l'utilisateur mis à jour.
     * @status 200 OK
     */
    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable UUID id, @Valid @RequestBody UserRequest userRequest) {
        return userService.updateUser(id, userRequest);
    }

    /**
     * Supprime définitivement un utilisateur du système.
     *
     * @param id Identifiant UUID de l'utilisateur à supprimer.
     * @status 204 No Content
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
    }
}