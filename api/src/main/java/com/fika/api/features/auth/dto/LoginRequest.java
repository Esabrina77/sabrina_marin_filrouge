package com.fika.api.features.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Schema(description = "Email de l'utilisateur", example = "marin@example.com") @NotBlank(message = "L'email est obligatoire")String email,
        @Schema(description = "Mot de passe de l'utilisateur", example = "password123") @NotBlank(message = "Le mot de passe est obligatoire")String password
) {}