package com.fika.api.core.exceptions.user;

import com.fika.api.core.exceptions.base.BaseBusinessException;
import com.fika.api.core.exceptions.base.BusinessErrorCode;
import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends BaseBusinessException {
    public EmailAlreadyExistsException(String message) {
        super(message,
                BusinessErrorCode.DATA_CONFLICT,
                HttpStatus.CONFLICT,
                "Conflit de données");
    }
}
