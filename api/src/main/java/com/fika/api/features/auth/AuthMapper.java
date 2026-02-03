package com.fika.api.features.auth;

import com.fika.api.features.auth.dto.LoginResponse;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.features.users.model.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    /**
     * Transforme un utilisateur et ses jetons en une réponse de connexion complète.
     * <p>
     * Cette méthode encapsule les informations de profil dans une
     * {@link UserResponse} pour assurer la cohérence des données renvoyées au
     * client.
     * </p>
     *
     * @param user         L'entité utilisateur récupérée de la base de données.
     * @param token        Le jeton d'accès (JWT) généré pour la session.
     * @param refreshToken Le jeton de rafraîchissement généré pour la session.
     * @return Une {@link LoginResponse} contenant les infos utilisateur et les
     *         jetons, ou {@code null} si l'utilisateur est nul.
     */
    public LoginResponse toResponse(User user, String token, String refreshToken) {
        if (user == null)
            return null;

        return new LoginResponse(
                new UserResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole()),
                token,
                refreshToken);
    }
}
