package com.fika.api.features.auth;

import com.fika.api.features.auth.dto.LoginResponse;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.features.users.model.User;
import org.springframework.stereotype.Component;

@Component
public class LoginMapper {

    public LoginResponse toResponse(User user, String token) {
        if (user == null) return null;

        return new LoginResponse(
                new UserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getRole()
                ),
                token
        );
    }
}
