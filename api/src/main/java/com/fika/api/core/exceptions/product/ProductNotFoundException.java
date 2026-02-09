package com.fika.api.core.exceptions.product;

import java.util.UUID;

import com.fika.api.core.exceptions.BaseBusinessException;
import com.fika.api.core.exceptions.BusinessErrorCode;
import org.springframework.http.HttpStatus;

public class ProductNotFoundException extends BaseBusinessException {
    public ProductNotFoundException(String message) {
        super(message,
                BusinessErrorCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Produit introuvable");
    }

    public ProductNotFoundException(UUID id) {
        super(String.format("Produit avec l'id %s n'existe pas", id),
                BusinessErrorCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Produit introuvable");
    }
}
