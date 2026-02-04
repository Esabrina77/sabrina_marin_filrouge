package com.fika.api.core.exceptions.product;

import java.util.UUID;

public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(String message) {
        super(message);
    }
    public ProductNotFoundException(UUID id) {super(String.format("User with id %s not found", id)); }
}
