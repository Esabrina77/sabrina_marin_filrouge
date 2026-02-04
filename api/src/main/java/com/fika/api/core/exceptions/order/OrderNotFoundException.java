package com.fika.api.core.exceptions.order;

import java.util.UUID;

public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String message) {
        super(message);
    }
    public OrderNotFoundException(UUID id) {super(String.format("Commande avec l'id %s n'existe pas", id)); }
}
