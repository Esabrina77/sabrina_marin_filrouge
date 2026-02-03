package com.fika.api.features.users;

import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Users", description = "Gestion des utilisateurs")
public class UserController {

    private final UserService userService;

    /**
     * Récupère le profil de l'utilisateur actuellement authentifié.
     * <p>
     * Utilise le contexte de sécurité pour identifier l'utilisateur via son JWT.
     * </p>
     *
     * @return UserResponse contenant les détails de l'utilisateur connecté.
     * @status 200 OK
     */
    @Operation(summary = "Récupérer mon profil", description = "Récupère les détails de l'utilisateur actuellement connecté.")
    @GetMapping("/me")
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        return userService.getCurrentUser(currentPrincipalName);
    }

    /**
     * Crée un nouvel utilisateur dans le système.
     *
     * @param userRequest DTO contenant les informations de l'utilisateur (validé
     *                    par @Valid).
     * @return UserResponse contenant les données de l'utilisateur créé.
     * @status 201 Created
     */
    @Operation(summary = "Créer un utilisateur", description = "Crée un nouvel utilisateur avec le rôle CLIENT par défaut.")
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
    @Operation(summary = "Lister les utilisateurs", description = "Récupère la liste de tous les utilisateurs (Admin uniquement recommandé).")
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
    @Operation(summary = "Récupérer un utilisateur", description = "Récupère les détails d'un utilisateur par son UUID.")
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
    @Operation(summary = "Modifier un utilisateur", description = "Met à jour les informations d'un utilisateur existant.")
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
    @Operation(summary = "Supprimer un utilisateur", description = "Supprime un utilisateur par son UUID (ADMIN uniquement).")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
    }

    /**
     * Supprime tous les utilisateurs du système.
     * 
     * @status 204 No Content
     */
    @Operation(summary = "Supprimer TOUS les utilisateurs", description = "Supprime tous les utilisateurs de la base (ADMIN uniquement - DANGEREUX).")
    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllUser() {
        userService.deleteUsers();
    }
}