package com.fika.api.core.exceptions;

import com.fika.api.core.exceptions.user.EmailAlreadyExistsException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {

        String errorMessage = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .map(org.springframework.context.support.DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(java.util.stream.Collectors.joining(", "));

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                errorMessage);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Gère les échecs d'authentification (mauvais mot de passe ou email inexistant).
     * Renvoie une réponse 401 Unauthorized pour éviter de donner trop d'indices
     * sur la raison exacte de l'échec (sécurité).
     *
     * @return Une {@link ResponseEntity} contenant les détails de l'erreur au format {@link ErrorResponse}.
     */
    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials() {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                "Authentification échouée",
                "Email ou mot de passe incorrect"
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}