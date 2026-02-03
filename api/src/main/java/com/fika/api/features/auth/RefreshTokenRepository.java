package com.fika.api.features.auth;

import com.fika.api.features.auth.model.RefreshToken;
import com.fika.api.features.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Interface de dépôt (Repository) pour l'entité {@link RefreshToken}.
 * <p>
 * Fournit les méthodes nécessaires pour la persistance et la gestion des
 * jetons de rafraîchissement dans la base de données.
 * </p>
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, java.util.UUID> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    int deleteByUser(Optional<User> user);
}
