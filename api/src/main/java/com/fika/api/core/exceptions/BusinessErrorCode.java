package com.fika.api.core.exceptions;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Énumération des codes d'erreur métier pour faciliter le traitement côté
 * client.
 */
@Getter
@RequiredArgsConstructor
public enum BusinessErrorCode {
    TECHNICAL_ERROR("TECH_001"),
    RESOURCE_NOT_FOUND("RES_001"),
    VALIDATION_FAILED("VAL_001"),
    INSUFFICIENT_STOCK("PRODUCT_001"),
    INVALID_ORDER_STATE("ORDER_001"),
    ACCESS_DENIED("AUTH_003"),
    UNAUTHORIZED("AUTH_001"),
    REFRESH_TOKEN_EXPIRED("AUTH_002"),
    DATA_CONFLICT("DATA_001"),
    MALFORMED_REQUEST("REQ_001");

    private final String code;
}
