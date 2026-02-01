package com.fika.api.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @NotNull(message =  "Le prénom est obligatoire")
        String firstName,

        @NotNull(message =  "Le nom est obligatoire")
        String lastName,

        @Email(message = "Email invalide")
        @NotBlank
        String email,

        @Size(min = 8, max = 20, message = "Le mot de passe doit faire entre 8 et 20 caractères")
        String password
) {}
