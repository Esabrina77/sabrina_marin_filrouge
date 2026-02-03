package com.fika.api.core.config;

import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String @NonNull ... args) {
        if (!userRepository.existsByEmail("marin@example.com")) {
            User admin = User.builder()
                    .firstName("Marin")
                    .lastName("Harel")
                    .email("marin@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
        if (!userRepository.existsByEmail("sabrina@example.com")) {
            User admin = User.builder()
                    .firstName("Sabrina")
                    .lastName("Eloundou")
                    .email("sabrina@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }
}
