package com.fika.api.core.exceptions.order;

/**
 * Exception levée lorsqu'un changement d'état d'une commande est invalide
 * (ex: annuler une commande qui n'est plus PENDING).
 */
import com.fika.api.core.exceptions.BaseBusinessException;
import com.fika.api.core.exceptions.BusinessErrorCode;
import org.springframework.http.HttpStatus;

public class InvalidOrderStateException extends BaseBusinessException {
    public InvalidOrderStateException(String message) {
        super(message,
                BusinessErrorCode.INVALID_ORDER_STATE,
                HttpStatus.BAD_REQUEST,
                "État de commande invalide");
    }
}
