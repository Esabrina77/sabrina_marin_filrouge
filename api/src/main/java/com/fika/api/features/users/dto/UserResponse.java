package com.fika.api.features.users.dto;

import com.fika.api.features.users.model.Role;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstName,
        String LastName,
        String email,
        Role role
) {}
