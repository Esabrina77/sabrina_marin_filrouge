package com.fika.api.features.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserProfileRequest(
        @Schema(description = "Prénom de l'utilisateur", example = "Marin") @NotNull(message = "Le prénom est obligatoire") String firstName,
        @Schema(description = "Nom de l'utilisateur", example = "Harel") @NotNull(message = "Le nom est obligatoire") String lastName,
        @Schema(description = "Adresse email de l'utilisateur", example = "marin@example.com") @Email(message = "Email invalide") @NotBlank(message = "L'email est obligatoire") String email) {
}
