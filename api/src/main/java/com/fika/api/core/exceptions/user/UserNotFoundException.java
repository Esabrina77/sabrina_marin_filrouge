package com.fika.api.core.exceptions.user;

import java.util.UUID;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(UUID id) {
        super(String.format("User with id %s not found", id));
    }

    public UserNotFoundException(String message) {
        super(message);
    }
}
