package com.fika.api.features.auth;

import com.fika.api.core.exceptions.auth.RefreshTokenExpiredException;
import com.fika.api.features.auth.model.RefreshToken;
import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
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
    public RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(Optional.ofNullable(user));
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
     * @param token Le jeton à vérifier.
     * @return Le jeton s'il est encore valide.
     * @throws RefreshTokenExpiredException Si le jeton est expiré.
     */
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RefreshTokenExpiredException(token.getToken(), "Veuillez vous reconnecter.");
        }
        return token;
    }

    /**
     * Supprime tous les jetons de rafraîchissement associés à un ID utilisateur.
     *
     * @param userId L'UUID de l'utilisateur.
     * @return Le nombre de jetons supprimés.
     */
    @Transactional
    public int deleteByUserId(UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        return refreshTokenRepository.deleteByUser(user);
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
}
