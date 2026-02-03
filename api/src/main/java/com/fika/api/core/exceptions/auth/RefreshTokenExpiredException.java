package com.fika.api.core.exceptions.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsqu'un jeton de rafraîchissement a expiré.
 * <p>
 * Cette exception déclenche une réponse HTTP 401 (Unauthorized) pour signaler
 * au client qu'il doit se reconnecter manuellement.
 * </p>
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class RefreshTokenExpiredException extends RuntimeException {
    public RefreshTokenExpiredException(String token, String message) {
        super(String.format("Le jeton de rafraîchissement [%s] a expiré. %s", token, message));
    }
}
