package com.fika.api.core.exceptions.order;

/**
 * Exception levée lorsqu'un changement d'état d'une commande est invalide
 * (ex: annuler une commande qui n'est plus PENDING).
 */
public class InvalidOrderStateException extends RuntimeException {
    public InvalidOrderStateException(String message) {
        super(message);
    }
}
