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
                "Not found",
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
                "Conflict",
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
                "Validation Failed",
                "Certains champs sont invalides",
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
                "Authentification échouée",
                "Email ou mot de passe incorrect");
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
                "Unauthorized",
                "Vous devez être authentifié pour accéder à cette ressource.");
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
                "Forbidden",
                "Vous n'avez pas les permissions nécessaires.");
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
                "Refresh Token Expired",
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
                "Refresh Token Not Found",
                ex.getMessage());
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
                "Bad Request",
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
                "Internal Server Error",
                "Une erreur inattendue est survenue: " + ex.getLocalizedMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}