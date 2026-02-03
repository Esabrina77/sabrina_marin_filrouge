package com.fika.api.features.auth;

import com.fika.api.features.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour la gestion de l'authentification (API v1).
 * <p>
 * Ce contrôleur gère les processus de connexion et d'inscription des
 * utilisateurs.
 * Toutes les routes sont préfixées par /api/v1/auth.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints pour l'inscription et la connexion")
@Slf4j
public class AuthController {
    private final AuthService authService;

    /**
     * Authentifie un utilisateur et retourne un jeton d'accès.
     *
     * @param loginRequest DTO contenant l'email et le mot de passe de
     *                     l'utilisateur.
     * @return LoginResponse contenant les informations de l'utilisateur et le jeton
     *         JWT.
     * @status 200 OK
     */
    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Connexion", description = "Authentifie un utilisateur et renvoie un Access Token et un Refresh Token.")
    @ApiResponse(responseCode = "200", description = "Authentification réussie")
    @ApiResponse(responseCode = "401", description = "Identifiants invalides", content = @Content(schema = @Schema(implementation = com.fika.api.core.exceptions.ErrorResponse.class)))
    public LoginResponse login(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    /**
     * Enregistre un nouvel utilisateur et le connecte automatiquement.
     *
     * @param registerRequest DTO contenant les informations d'inscription (nom,
     *                        prénom, email, mot de passe).
     * @return LoginResponse contenant les informations de l"utilisateur créé et le
     *         jeton JWT.
     * @status 201 Created
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Inscription", description = "Crée un nouveau compte et connecte l'utilisateur immédiatement.")
    @ApiResponse(responseCode = "201", description = "Compte créé avec succès")
    @ApiResponse(responseCode = "400", description = "Validation échouée", content = @Content(schema = @Schema(implementation = com.fika.api.core.exceptions.FormErrorResponse.class)))
    @ApiResponse(responseCode = "409", description = "L'email est déjà utilisé")
    public LoginResponse register(@Valid @RequestBody RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }

    @PostMapping("/refresh-token")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Rafraîchir le token", description = "Utilise un Refresh Token pour obtenir un nouvel Access Token.")
    @ApiResponse(responseCode = "200", description = "Nouveau token généré")
    @ApiResponse(responseCode = "400", description = "Refresh Token invalide ou manquant")
    @ApiResponse(responseCode = "401", description = "Refresh Token expiré")
    public TokenRefreshResponse refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return authService.refreshToken(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Déconnexion", description = "Invalide le Refresh Token de l'utilisateur.")
    @ApiResponse(responseCode = "204", description = "Déconnexion réussie (token révoqué)")
    public void logout(@Valid @RequestBody TokenRefreshRequest request) {
        authService.logout(request);
    }
}
