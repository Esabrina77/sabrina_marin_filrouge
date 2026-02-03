package com.fika.api.features.users.dto;

import com.fika.api.features.users.model.Role;

import java.util.UUID;

public record UserResponse(
                UUID id,
                String firstName,
                String lastName,
                String email,
                Role role) {
}
