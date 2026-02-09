package com.fika.api.core.exceptions.handler;

import com.fika.api.core.exceptions.base.BaseBusinessException;
import com.fika.api.core.exceptions.base.BusinessErrorCode;
import com.fika.api.core.exceptions.base.ErrorResponse;
import com.fika.api.core.exceptions.base.FormErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;

/**
 * Contrôleur de conseil (Advice) global pour la gestion des exceptions de
 * l'API.
 * Cette classe intercepte les exceptions levées par les services et les
 * transforme
 * en réponses HTTP structurées au format JSON.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Gère toutes les exceptions métier étendant BaseBusinessException.
     * centralise la création de la ErrorResponse pour tous les cas métiers.
     */
    @ExceptionHandler(BaseBusinessException.class)
    public ResponseEntity<ErrorResponse> handleBaseBusinessException(BaseBusinessException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                ex.getStatus().value(),
                ex.getErrorLabel(),
                ex.getMessage(),
                ex.getErrorCode().getCode());
        return ResponseEntity.status(ex.getStatus()).body(errorResponse);
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
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((org.springframework.validation.FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        FormErrorResponse errorResponse = new FormErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation échouée",
                "Certains champs du formulaire sont invalides.",
                BusinessErrorCode.VALIDATION_FAILED.getCode(),
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
                "Email ou mot de passe incorrect.",
                BusinessErrorCode.UNAUTHORIZED.getCode());
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
                "Vous devez être connecté pour accéder à cette ressource.",
                BusinessErrorCode.UNAUTHORIZED.getCode());
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
                "Vous n'avez pas les permissions nécessaires pour effectuer cette action.",
                BusinessErrorCode.ACCESS_DENIED.getCode());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
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
                "Le cookie '" + ex.getCookieName() + "' est obligatoire pour cette requête.",
                BusinessErrorCode.UNAUTHORIZED.getCode());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Gère l'exception lorsqu'un paramètre de requête a un type invalide (ex:
     * texte au lieu d'UUID).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Le paramètre '%s' a une valeur invalide : '%s'. Attendu : %s",
                ex.getName(), ex.getValue(),
                (ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "inconnu"));

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Format de paramètre invalide",
                message,
                BusinessErrorCode.MALFORMED_REQUEST.getCode());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Gère les erreurs de lecture du corps de la requête (ex: JSON malformé).
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Requête malformée",
                "Le corps de la requête est illisible ou malformé.",
                BusinessErrorCode.MALFORMED_REQUEST.getCode());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * Gère les violations d'intégrité des données (ex: contrainte unique en base).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflit de données",
                "L'action ne peut pas être effectuée car elle viole une contrainte d'intégrité (ex: doublon).",
                BusinessErrorCode.DATA_CONFLICT.getCode());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Gère toutes les autres exceptions non traitées explicitement (Erreur 500).
     *
     * @param ex L'exception capturée.
     * @return Une réponse HTTP 500 (Internal Server Error) au format standard.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {
        log.error("Erreur serveur non gérée : ", ex);
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erreur interne",
                "Une erreur inattendue est survenue : " + ex.getLocalizedMessage(),
                BusinessErrorCode.TECHNICAL_ERROR.getCode());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
