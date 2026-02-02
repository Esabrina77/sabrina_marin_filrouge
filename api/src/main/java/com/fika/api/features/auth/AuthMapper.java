package com.fika.api.features.auth;

import com.fika.api.features.auth.dto.LoginResponse;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.features.users.model.User;
import org.springframework.stereotype.Component;


@Component
public class AuthMapper {

    /**
     * Transforme un utilisateur et son jeton d'accès en une réponse de connexion complète.
     * Cette méthode encapsule les informations de profil dans une {@link UserResponse}
     * pour assurer la cohérence des données renvoyées au client.
     *
     * @param user  L'entité utilisateur récupérée de la base de données.
     * @param token Le jeton d'authentification (JWT) généré pour la session.
     * @return Une {@link LoginResponse} contenant les infos utilisateur et le token,
     * ou {@code null} si l'utilisateur est nul.
     */
    public LoginResponse toResponse(User user, String token) {
        if (user == null) return null;

        return new LoginResponse(
                new UserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getRole()
                ),
                token
        );
    }
}
