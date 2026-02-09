package com.fika.api.core.exceptions.auth;

import com.fika.api.core.exceptions.base.BaseBusinessException;
import com.fika.api.core.exceptions.base.BusinessErrorCode;
import org.springframework.http.HttpStatus;

/**
 * Exception levée lorsqu'un jeton de rafraîchissement n'est pas trouvé en base
 * de données.
 * <p>
 * Cela peut arriver si le jeton a déjà été utilisé (rotation) ou s'il est
 * totalement invalide.
 * </p>
 */
public class RefreshTokenNotFoundException extends BaseBusinessException {
    public RefreshTokenNotFoundException(String message) {
        super(message,
                BusinessErrorCode.UNAUTHORIZED,
                HttpStatus.BAD_REQUEST,
                "Session invalide");
    }
}
