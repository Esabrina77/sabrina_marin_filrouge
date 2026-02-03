package com.fika.api.features.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record TokenRefreshResponse(
        @Schema(description = "Le nouveau jeton d'accès (JWT)") String accessToken,
        @Schema(description = "Le même jeton de rafraîchissement ou un nouveau (rotation)") String refreshToken) {
}
