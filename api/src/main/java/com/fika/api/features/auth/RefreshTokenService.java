package com.fika.api.features.auth;

import com.fika.api.core.exceptions.auth.RefreshTokenExpiredException;
import com.fika.api.features.auth.model.RefreshToken;
import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Service gérant le cycle de vie des jetons de rafraîchissement (Refresh
 * Tokens).
 * <p>
 * Ce service permet de créer, vérifier l'expiration et supprimer les jetons
 * stockés en base de données pour assurer la sécurité des sessions.
 * </p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    /**
     * Crée un nouveau jeton de rafraîchissement pour un utilisateur donné.
     * <p>
     * Supprime tout jeton existant pour cet utilisateur avant d'en créer un nouveau
     * (rotation de jeton).
     * </p>
     *
     * @param user L'utilisateur pour lequel créer le jeton.
     * @return Le RefreshToken créé et sauvegardé.
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        log.debug("Création d'un refresh token pour l'utilisateur: {}", user.getEmail());

        // On cherche un token existant pour cet utilisateur
        refreshTokenRepository.findByUser(user).ifPresent(token -> {
            log.debug("Suppression de l'ancien token pour: {}", user.getEmail());
            refreshTokenRepository.delete(token);
            refreshTokenRepository.flush(); // Force la suppression en base immédiatement
        });

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Vérifie si un jeton de rafraîchissement a expiré.
     * <p>
     * Si le jeton est expiré, il est supprimé de la base de données et une
     * exception est levée.
     * </p>
     *
     * @param token Le jeton
     * @return Le jeton s'il est encore valide.
     * @throws RefreshTokenExpiredException Si le jeton est expiré.
     */
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            log.warn("Le refresh token a expiré pour l'utilisateur: {}", token.getUser().getEmail());
            refreshTokenRepository.delete(token);
            throw new RefreshTokenExpiredException(token.getToken(), "Veuillez vous reconnecter.");
        }
        return token;
    }

    /**
     * Supprime tous les jetons de rafraîchissement associés à un ID utilisateur.
     *
     * @param userId UUID de l'utilisateur.
     */
    @Transactional
    public void deleteByUserId(UUID userId) {
        log.debug("Suppression des tokens pour l'utilisateur ID: {}", userId);
        userRepository.findById(userId)
                .ifPresent(user -> refreshTokenRepository.findByUser(user)
                        .ifPresent(refreshTokenRepository::delete));
    }

    /**
     * Recherche un jeton de rafraîchissement par sa valeur textuelle.
     *
     * @param token La chaîne de caractères du jeton.
     * @return Un Optional contenant le RefreshToken s'il est trouvé.
     */
    public java.util.Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Supprime un jeton de rafraîchissement spécifique.
     *
     * @param refreshToken Le jeton à supprimer.
     */
    @Transactional
    public void deleteToken(RefreshToken refreshToken) {
        refreshTokenRepository.delete(refreshToken);
    }
}
