package com.fika.api.core.exceptions.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsqu'un jeton de rafraîchissement n'est pas trouvé en base
 * de données.
 * <p>
 * Cela peut arriver si le jeton a déjà été utilisé (rotation) ou s'il est
 * totalement invalide.
 * </p>
 */
import com.fika.api.core.exceptions.BaseBusinessException;
import com.fika.api.core.exceptions.BusinessErrorCode;

public class RefreshTokenNotFoundException extends BaseBusinessException {
    public RefreshTokenNotFoundException(String message) {
        super(message,
                BusinessErrorCode.UNAUTHORIZED,
                HttpStatus.BAD_REQUEST,
                "Session invalide");
    }
}
