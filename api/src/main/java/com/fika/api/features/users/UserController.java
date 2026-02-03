package com.fika.api.features.users;

import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
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
@Tag(name = "Users", description = "Gestion des comptes utilisateurs")
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
    @GetMapping("/me")
    @Operation(summary = "Mon profil", description = "Récupère les informations de l'utilisateur actuellement connecté.")
    @ApiResponse(responseCode = "200", description = "Profil récupéré")
    @ApiResponse(responseCode = "401", description = "Non authentifié")
    public UserResponse getCurrentUser(@AuthenticationPrincipal String email) {
        return userService.getCurrentUser(email);
    }

    /**
     * Crée un nouvel utilisateur dans le système.
     *
     * @param userRequest DTO contenant les informations de l'utilisateur (validé
     *                    par @Valid).
     * @return UserResponse contenant les données de l'utilisateur créé.
     * @status 201 Created
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer un utilisateur", description = "Crée un nouveau compte utilisateur dans le système.")
    @ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides", content = @Content(schema = @Schema(implementation = com.fika.api.core.exceptions.FormErrorResponse.class)))
    @ApiResponse(responseCode = "409", description = "L'email existe déjà", content = @Content(schema = @Schema(implementation = com.fika.api.core.exceptions.ErrorResponse.class)))
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
    @Operation(summary = "Lister les utilisateurs", description = "Récupère une page de tous les utilisateurs (Réservé aux ADMINS).")
    @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès")
    @ApiResponse(responseCode = "403", description = "Accès refusé - Rôle ADMIN requis")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> getAllUsers(@ParameterObject Pageable pageable) {
        return userService.getAllUsers(pageable);
    }

    /**
     * Récupère les détails d'un utilisateur spécifique par son identifiant unique.
     *
     * @param id Identifiant UUID de l'utilisateur.
     * @return UserResponse de l'utilisateur trouvé.
     * @status 200 OK ou 404 Not Found (via GlobalExceptionHandler)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un utilisateur", description = "Récupère les détails d'un utilisateur par son ID.")
    @ApiResponse(responseCode = "200", description = "Utilisateur trouvé")
    @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content(schema = @Schema(implementation = com.fika.api.core.exceptions.ErrorResponse.class)))
    public UserResponse getUserById(
            @Parameter(description = "ID unique de l'utilisateur", example = "550e8400-e29b-41d4-a716-446655440000") @PathVariable UUID id) {
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
    @Operation(summary = "Mettre à jour un utilisateur", description = "Met à jour les informations d'un utilisateur existant.")
    @ApiResponse(responseCode = "200", description = "Utilisateur mis à jour")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    public UserResponse updateUser(
            @Parameter(description = "ID de l'utilisateur à modifier") @PathVariable UUID id,
            @Valid @RequestBody UserRequest userRequest) {
        return userService.updateUser(id, userRequest);
    }

    /**
     * Supprime définitivement un utilisateur du système.
     *
     * @param id Identifiant UUID de l'utilisateur à supprimer.
     * @status 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer un utilisateur", description = "Supprime un utilisateur du système par son ID.")
    @ApiResponse(responseCode = "204", description = "Utilisateur supprimé")
    @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    public void deleteUser(@Parameter(description = "ID de l'utilisateur à supprimer") @PathVariable UUID id) {
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