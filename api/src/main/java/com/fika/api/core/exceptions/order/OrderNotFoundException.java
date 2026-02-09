package com.fika.api.core.exceptions.order;

import java.util.UUID;

import com.fika.api.core.exceptions.BaseBusinessException;
import com.fika.api.core.exceptions.BusinessErrorCode;
import org.springframework.http.HttpStatus;

public class OrderNotFoundException extends BaseBusinessException {
    public OrderNotFoundException(String message) {
        super(message,
                BusinessErrorCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Commande introuvable");
    }

    public OrderNotFoundException(UUID id) {
        super(String.format("Commande avec l'id %s n'existe pas", id),
                BusinessErrorCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Commande introuvable");
    }
}
