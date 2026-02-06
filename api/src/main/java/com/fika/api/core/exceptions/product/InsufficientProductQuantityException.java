package com.fika.api.core.exceptions.product;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsqu'un produit n'a pas assez de stock pour satisfaire une
 * commande.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InsufficientProductQuantityException extends RuntimeException {
    public InsufficientProductQuantityException(String productName, int available, int requested) {
        super(String.format("Stock insuffisant pour le produit '%s'. Disponible: %d, Demandé: %d",
                productName, available, requested));
    }
}
