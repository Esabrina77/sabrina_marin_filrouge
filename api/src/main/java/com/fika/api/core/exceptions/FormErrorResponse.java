package com.fika.api.core.exceptions;

import java.time.LocalDateTime;
import java.util.Map;

public record FormErrorResponse(
                LocalDateTime timestamp,
                int status,
                String error,
                String message,
                Map<String, String> errors) {
}
