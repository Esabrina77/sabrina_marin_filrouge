package com.fika.api.features.users;

import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import org.springframework.stereotype.Component;

/**
 * Composant responsable de la conversion entre les entités User et les DTOs.
 * Centralise la logique de mapping pour assurer la cohérence des données
 * exposées via l'API.
 */
@Component
public class UserMapper {

    /**
     * Transforme une entité User en DTO UserResponse.
     * Cette méthode est utilisée pour préparer les données à envoyer au client,
     * en excluant les informations sensibles comme le mot de passe.
     *
     * @param user L'entité utilisateur provenant de la base de données.
     * @return Un DTO UserResponse ou null si l'entrée est nulle.
     */
    public UserResponse toResponse(User user) {
        if (user == null)
            return null;
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole());
    }

    /**
     * Transforme un DTO UserRequest en entité User.
     * Utilisé par exemple lors de la création d'un utilisateur. Par défaut, le rôle
     * CLIENT
     * est attribué.
     *
     * @param request Le DTO contenant les données de création.
     * @return Une entité User prête pour la persistance ou null si l'entrée est
     *         nulle.
     */
    public User toEntity(UserRequest request) {
        if (request == null)
            return null;
        return User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(request.password())
                .role(request.role() != null ? request.role() : Role.CLIENT)
                .build();
    }
}