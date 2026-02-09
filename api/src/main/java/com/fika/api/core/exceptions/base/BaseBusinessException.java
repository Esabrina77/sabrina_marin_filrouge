package com.fika.api.core.exceptions.base;

import org.springframework.http.HttpStatus;
import lombok.Getter;

/**
 * Classe de base pour toutes les exceptions métier de l'application.
 * <p>
 * Elle permet de centraliser le code d'erreur, le statut HTTP et le libellé
 * pour simplifier la gestion globale des erreurs.
 * </p>
 */
@Getter
public abstract class BaseBusinessException extends RuntimeException {
    private final BusinessErrorCode errorCode;
    private final HttpStatus status;
    private final String errorLabel;

    protected BaseBusinessException(String message, BusinessErrorCode errorCode, HttpStatus status, String errorLabel) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
        this.errorLabel = errorLabel;
    }
}
