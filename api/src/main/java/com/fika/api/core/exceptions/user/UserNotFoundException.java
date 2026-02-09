package com.fika.api.core.exceptions.user;

import java.util.UUID;

import com.fika.api.core.exceptions.base.BaseBusinessException;
import com.fika.api.core.exceptions.base.BusinessErrorCode;
import org.springframework.http.HttpStatus;

public class UserNotFoundException extends BaseBusinessException {
    public UserNotFoundException(UUID id) {
        super(String.format("User avec l'id %s n'existe pas", id),
                BusinessErrorCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Ressource introuvable");
    }

    public UserNotFoundException(String message) {
        super(message,
                BusinessErrorCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Ressource introuvable");
    }
}
