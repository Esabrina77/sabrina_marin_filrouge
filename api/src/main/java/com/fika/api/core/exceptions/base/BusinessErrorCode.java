package com.fika.api.core.exceptions.base;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Énumération des codes d'erreur métier pour faciliter le traitement côté
 * client.
 * <p>
 * Ces codes sont sémantiques (ex: "insufficient_stock") pour être explicites
 * et faciliter le debug et la traduction côté frontend.
 * </p>
 */
@Getter
@RequiredArgsConstructor
public enum BusinessErrorCode {
    TECHNICAL_ERROR("technical_error"),
    RESOURCE_NOT_FOUND("resource_not_found"),
    VALIDATION_FAILED("validation_failed"),
    INSUFFICIENT_STOCK("insufficient_stock"),
    INVALID_ORDER_STATE("invalid_order_state"),
    ACCESS_DENIED("access_denied"),
    UNAUTHORIZED("unauthorized"),
    REFRESH_TOKEN_EXPIRED("refresh_token_expired"),
    DATA_CONFLICT("data_conflict"),
    MALFORMED_REQUEST("malformed_request");

    private final String code;
}
