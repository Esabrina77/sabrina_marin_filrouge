package com.fika.api.core.exceptions.base;

import java.time.LocalDateTime;

public record ErrorResponse(
                LocalDateTime timestamp,
                int status,
                String error,
                String message,
                String code) {
}