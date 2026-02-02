package com.fika.api.features.auth;

import com.fika.api.features.auth.dto.LoginRequest;
import com.fika.api.features.auth.dto.LoginResponse;
import com.fika.api.features.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public LoginResponse register(@Valid @RequestBody RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }
}
