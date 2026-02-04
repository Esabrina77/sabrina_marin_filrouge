package com.fika.api.core.exceptions.product;

import java.util.UUID;

public class ProductNotFoundException extends RuntimeException {
    @SuppressWarnings("unused")
    public ProductNotFoundException(String message) {
        super(message);
    }
    public ProductNotFoundException(UUID id) {super(String.format("Produit avec l'id %s n'existe pas", id)); }
}
