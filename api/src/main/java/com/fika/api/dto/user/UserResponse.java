package com.fika.api.dto.user;

import com.fika.api.model.Role;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstName,
        String LastName,
        String email,
        Role role
) {}
