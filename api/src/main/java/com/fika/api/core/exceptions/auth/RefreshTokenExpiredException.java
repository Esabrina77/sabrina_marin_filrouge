package com.fika.api.core.exceptions.auth;

import org.springframework.http.HttpStatus;

/**
 * Exception levée lorsqu'un jeton de rafraîchissement a expiré.
 * <p>
 * Cette exception déclenche une réponse HTTP 401 (Unauthorized) pour signaler
 * au client qu'il doit se reconnecter manuellement.
 * </p>
 */
import com.fika.api.core.exceptions.BaseBusinessException;
import com.fika.api.core.exceptions.BusinessErrorCode;

public class RefreshTokenExpiredException extends BaseBusinessException {
    public RefreshTokenExpiredException(String token, String message) {
        super(String.format("Le jeton de rafraîchissement [%s] a expiré. %s", token, message),
                BusinessErrorCode.REFRESH_TOKEN_EXPIRED,
                HttpStatus.UNAUTHORIZED,
                "Session expirée. Veuillez vous reconnecter");
    }
}
