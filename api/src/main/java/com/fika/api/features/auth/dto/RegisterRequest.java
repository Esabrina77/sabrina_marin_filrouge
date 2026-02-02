package com.fika.api.features.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Schema(description = "Prénom de l'utilisateur", example = "Marin") @NotNull(message = "Le prénom est obligatoire") String firstName,
        @Schema(description = "Nom de l'utilisateur", example = "Harel") @NotNull(message = "Le nom est obligatoire") String lastName,
        @Schema(description = "Adresse email de l'utilisateur", example = "marin@example.com") @Email(message = "Email invalide") @NotBlank String email,
        @Schema(description = "Mot de passe de l'utilisateur", example = "password123") @Size(min = 8, max = 20, message = "Le mot de passe doit faire entre 8 et 20 caractères") String password
) {}
