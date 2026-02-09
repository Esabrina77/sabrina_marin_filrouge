package com.fika.api.core.exceptions.product;

import com.fika.api.core.exceptions.base.BaseBusinessException;
import com.fika.api.core.exceptions.base.BusinessErrorCode;
import org.springframework.http.HttpStatus;

/**
 * Exception levée lorsqu'un produit n'a pas assez de stock pour satisfaire une
 * commande.
 */

public class InsufficientProductQuantityException extends BaseBusinessException {
    public InsufficientProductQuantityException(String productName, int available, int requested) {
        super(String.format("Stock insuffisant pour le produit '%s'. Disponible: %d, Demandé: %d",
                productName, available, requested),
                BusinessErrorCode.INSUFFICIENT_STOCK,
                HttpStatus.BAD_REQUEST,
                "Stock insuffisant");
    }
}
