package com.fika.api.features.auth;

import com.fika.api.core.exceptions.auth.RefreshTokenExpiredException;
import com.fika.api.core.exceptions.auth.RefreshTokenNotFoundException;
import com.fika.api.core.jwt.JwtService;
import com.fika.api.features.auth.dto.*;
import com.fika.api.features.auth.model.RefreshToken;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.features.users.UserService;
import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.model.User;
import com.fika.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service gérant la logique métier liée à l'authentification.
 * Ce service s'occupe de la validation des identifiants et de la génération des
 * réponses de connexion/inscription.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;
    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    /**
     * Authentifie un utilisateur en vérifiant son email et son mot de passe.
     *
     * @param loginRequest Les informations de connexion fournies par l'utilisateur.
     * @return Une réponse contenant les détails de l'utilisateur et les jetons
     *         d'authentification.
     * @throws BadCredentialsException Si l'email n'existe pas ou si le mot de passe
     *                                 est incorrect.
     */
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> {
                    return new BadCredentialsException("Email ou mot de passe incorrect");
                });
        if (!passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        }
        String token = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        return authMapper.toResponse(user, token, refreshToken.getToken());
    }

    /**
     * Inscrit un nouvel utilisateur dans le système.
     *
     * @param registerRequest Les informations d'inscription fournies par
     *                        l'utilisateur.
     * @return Une réponse contenant les détails de l'utilisateur créé et les jetons
     *         d'authentification.
     */
    @Transactional
    public LoginResponse register(RegisterRequest registerRequest) {
        UserRequest userRequest = new UserRequest(
                registerRequest.firstName(),
                registerRequest.lastName(),
                registerRequest.email(),
                registerRequest.password(),
                null);

        UserResponse userResponse = userService.createUser(userRequest);
        User user = userRepository.findByEmail(userResponse.email())
                .orElseThrow(() -> new RuntimeException("User not found after creation"));
        String token = jwtService.generateToken(user);
        com.fika.api.features.auth.model.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        return authMapper.toResponse(user, token, refreshToken.getToken());
    }

    /**
     * Renouvelle un jeton d'accès (JWT) à partir d'un jeton de rafraîchissement.
     * <p>
     * Vérifie la validité du jeton de rafraîchissement et génère un nouveau JWT
     * pour l'utilisateur associé.
     * </p>
     *
     * @param request Le DTO contenant le jeton de rafraîchissement.
     * @return Une réponse contenant le nouveau JWT et le jeton de rafraîchissement.
     * @throws RefreshTokenNotFoundException Si le jeton n'existe pas.
     * @throws RefreshTokenExpiredException  Si le jeton a expiré.
     */
    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.refreshToken();
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtService.generateToken(user);
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);
                    return new TokenRefreshResponse(token, newRefreshToken.getToken());
                })
                .orElseThrow(() -> new RefreshTokenNotFoundException("Le jeton de rafraîchissement est introuvable."));
    }

    /**
     * Déconnecte un utilisateur en supprimant son jeton de rafraîchissement.
     *
     * @param request Le DTO contenant le Refresh Token à révoquer.
     */
    @Transactional
    public void logout(TokenRefreshRequest request) {
        String token = request.refreshToken();
        refreshTokenService.findByToken(token).ifPresent(refreshTokenService::deleteToken);
    }
}
