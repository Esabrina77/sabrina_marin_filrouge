package com.fika.api.features.auth.model;

import com.fika.api.features.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Entité représentant un jeton de rafraîchissement (Refresh Token) en base de
 * données.
 * <p>
 * Ce jeton permet de renouveler un jeton d'accès (JWT) sans que l'utilisateur
 * n'ait à
 * se reconnecter manuellement. Il est lié à un utilisateur spécifique.
 * </p>
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
