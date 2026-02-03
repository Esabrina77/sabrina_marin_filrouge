package com.fika.api.features.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record TokenRefreshRequest(
        @Schema(description = "Le jeton de rafraîchissement", example = "550e8400-e29b-41d4-a716-446655440000") @NotBlank(message = "Le jeton de rafraîchissement est obligatoire") String refreshToken) {
}
