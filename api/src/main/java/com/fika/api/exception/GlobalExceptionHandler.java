package com.fika.api.exception;

import com.fika.api.exception.user.EmailAlreadyExistsException;
import com.fika.api.exception.user.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

/**
 * Contrôleur de conseil (Advice) global pour la gestion des exceptions de l'API.
 * Cette classe intercepte les exceptions levées par les services et les transforme
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
    public ResponseEntity<?> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not found",
                ex.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Gère l'exception lorsqu'un utilisateur tente d'utiliser un email déjà existant.
     *
     * @param ex L'exception EmailAlreadyExistsException levée.
     * @return Une réponse HTTP 409 (Conflict) avec les détails de l'erreur.
     */
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<?> handleEmailAlreadyExistsException(EmailAlreadyExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflict",
                ex.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }
}