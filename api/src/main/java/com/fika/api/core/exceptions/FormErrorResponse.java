package com.fika.api.core.exceptions;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO représentant une réponse d'erreur de formulaire structurée.
 * <p>
 * Ce format est utilisé spécifiquement pour les erreurs de validation (400 Bad
 * Request)
 * afin de fournir au front-end une liste détaillée des erreurs par champ.
 * </p>
 *
 * @param timestamp Le moment où l'erreur est survenue.
 * @param status    Le code de statut HTTP.
 * @param error     Le type d'erreur (ex: "Validation Failed").
 * @param message   Un message global décrivant l'erreur.
 * @param errors    Une map contenant les erreurs par champ (ex: "email" ->
 *                  "format
 *                  invalide").
 */
public record FormErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> errors) {
}
