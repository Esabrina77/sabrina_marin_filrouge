package com.fika.api.features.auth;

import com.fika.api.features.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
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
public class AuthController {
        private final AuthService authService;
        private final com.fika.api.core.utils.CookieUtil cookieUtil;

        @PostMapping("/login")
        @Operation(summary = "Connexion", description = "Authentifie un utilisateur et renvoie un Access Token (JSON) et un Refresh Token (Cookie HttpOnly).")
        @ApiResponse(responseCode = "200", description = "Authentification réussie")
        @ApiResponse(responseCode = "401", description = "Identifiants invalides", content = @Content(schema = @Schema(implementation = com.fika.api.core.exceptions.ErrorResponse.class)))
        public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
                LoginResponse loginResponse = authService.login(loginRequest);
                ResponseCookie refreshTokenCookie = cookieUtil.createRefreshTokenCookie(loginResponse.refreshToken());
                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                                .body(loginResponse);
        }

        @PostMapping("/register")
        @Operation(summary = "Inscription", description = "Crée un nouveau compte et connecte l'utilisateur (Access Token JSON + Refresh Token Cookie).")
        @ApiResponse(responseCode = "201", description = "Compte créé avec succès")
        @ApiResponse(responseCode = "400", description = "Validation échouée", content = @Content(schema = @Schema(implementation = com.fika.api.core.exceptions.FormErrorResponse.class)))
        @ApiResponse(responseCode = "409", description = "L'email est déjà utilisé")
        public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
                LoginResponse loginResponse = authService.register(registerRequest);
                ResponseCookie refreshTokenCookie = cookieUtil.createRefreshTokenCookie(loginResponse.refreshToken());
                return ResponseEntity.status(HttpStatus.CREATED)
                                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                                .body(loginResponse);
        }

        @PostMapping("/refresh-token")
        @Operation(summary = "Rafraîchir le token", description = "Utilise le Refresh Token (cookie) pour obtenir un nouveau Access Token (JSON).")
        @ApiResponse(responseCode = "200", description = "Nouveaux tokens générés (Access en JSON, Refresh en Cookie)")
        public ResponseEntity<TokenRefreshResponse> refreshToken(
                        @io.swagger.v3.oas.annotations.Parameter(hidden = true) @CookieValue(name = "refreshToken") String refreshToken) {
                TokenRefreshRequest request = new TokenRefreshRequest(refreshToken);
                TokenRefreshResponse refreshResponse = authService.refreshToken(request);

                ResponseCookie refreshTokenCookie = cookieUtil.createRefreshTokenCookie(refreshResponse.refreshToken());

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                                .body(refreshResponse);
        }

        @PostMapping("/logout")
        @Operation(summary = "Déconnexion", description = "Invalide le Refresh Token en base et supprime le cookie.")
        @ApiResponse(responseCode = "204", description = "Déconnexion réussie")
        public ResponseEntity<Void> logout(
                        @io.swagger.v3.oas.annotations.Parameter(hidden = true) @CookieValue(name = "refreshToken") String refreshToken) {
                TokenRefreshRequest request = new TokenRefreshRequest(refreshToken);
                authService.logout(request);
                ResponseCookie deleteRefreshToken = cookieUtil.deleteRefreshTokenCookie();
                return ResponseEntity.noContent()
                                .header(HttpHeaders.SET_COOKIE, deleteRefreshToken.toString())
                                .build();
        }
}
