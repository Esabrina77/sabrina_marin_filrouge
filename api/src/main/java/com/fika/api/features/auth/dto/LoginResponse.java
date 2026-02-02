package com.fika.api.features.auth.dto;

import com.fika.api.features.users.dto.UserResponse;

public record LoginResponse(
        UserResponse user,
        String token
) {}