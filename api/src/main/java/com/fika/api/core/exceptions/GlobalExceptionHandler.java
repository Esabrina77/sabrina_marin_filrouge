package com.fika.api.core.exceptions;

import com.fika.api.core.exceptions.user.EmailAlreadyExistsException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import java.time.LocalDateTime;

/**
 * Contrôleur de conseil (Advice) global pour la gestion des exceptions de
 * l'API.
 * Cette classe intercepte les exceptions levées par les services et les
 * transforme
 * en réponses HTTP structurées au format JSON.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Gère l'exception lorsqu'un utilisateur n'est pas trouvé.
     *
     * @param ex L'exception UserNotFoundException levée.
     * @return Une réponse HTTP 404 (Not Found) avec les détails de l'erreur.
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Ressource introuvable",
                ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Gère l'exception lorsqu'un utilisateur tente d'utiliser un email déjà
     * existant.
     *
     * @param ex L'exception EmailAlreadyExistsException levée.
     * @return Une réponse HTTP 409 (Conflict) avec les détails de l'erreur.
     */
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExistsException(EmailAlreadyExistsException ex) {

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflit de données",
                ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Gère l'exception lorsqu'une validation de requête échoue (@Valid).
     *
     * @param ex L'exception MethodArgumentNotValidException levée.
     * @return Une réponse HTTP 400 (Bad Request) avec les détails des erreurs de
     *         validation.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<FormErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        java.util.Map<String, String> errors = new java.util.HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((org.springframework.validation.FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        FormErrorResponse errorResponse = new FormErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation échouée",
                "Certains champs du formulaire sont invalides.",
                errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Gère les échecs d'authentification (mauvais mot de passe ou email
     * inexistant).
     * Renvoie une réponse 401 Unauthorized pour éviter de donner trop d'indices
     * sur la raison exacte de l'échec (sécurité).
     *
     * @return Une {@link ResponseEntity} contenant les détails de l'erreur au
     *         format {@link ErrorResponse}.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials() {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Échec d'authentification",
                "Email ou mot de passe incorrect.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Gère les erreurs d'authentification (ex: token manquant ou invalide).
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException() {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Authentification requise",
                "Vous devez être connecté pour accéder à cette ressource.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Gère les erreurs d'accès refusé (ex: rôle insuffisant).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException() {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                "Accès interdit",
                "Vous n'avez pas les permissions nécessaires pour effectuer cette action.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Gère l'exception lorsqu'un jeton de rafraîchissement a expiré.
     *
     * @param ex L'exception capturée.
     * @return Une réponse HTTP 401 (Unauthorized) au format standard.
     */
    @ExceptionHandler(com.fika.api.core.exceptions.auth.RefreshTokenExpiredException.class)
    public ResponseEntity<ErrorResponse> handleRefreshTokenExpiredException(
            com.fika.api.core.exceptions.auth.RefreshTokenExpiredException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Session expirée. Veuillez vous reconnecter",
                ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Gère l'exception lorsqu'un jeton de rafraîchissement est introuvable.
     *
     * @param ex L'exception capturée.
     * @return Une réponse HTTP 400 (Bad Request) au format standard.
     */
    @ExceptionHandler(com.fika.api.core.exceptions.auth.RefreshTokenNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRefreshTokenNotFoundException(
            com.fika.api.core.exceptions.auth.RefreshTokenNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Session invalide",
                ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Gère l'exception lorsqu'un cookie requis (ex: refreshToken) est manquant.
     */
    @ExceptionHandler(org.springframework.web.bind.MissingRequestCookieException.class)
    public ResponseEntity<ErrorResponse> handleMissingRequestCookieException(
            org.springframework.web.bind.MissingRequestCookieException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Session expirée. Veuillez vous reconnecter",
                "Le cookie '" + ex.getCookieName() + "' est obligatoire pour cette requête.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Gère les exceptions de type Runtime non explicitées.
     *
     * @param ex L'exception capturée.
     * @return Une réponse HTTP 400 (Bad Request) au format standard.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Requête invalide",
                ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Gère toutes les autres exceptions non traitées explicitement (Erreur 500).
     *
     * @param ex L'exception capturée.
     * @return Une réponse HTTP 500 (Internal Server Error) au format standard.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erreur interne",
                "Une erreur inattendue est survenue : " + ex.getLocalizedMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}