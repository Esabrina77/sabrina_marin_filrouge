package com.fika.api.core.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Service : JWT")
class JwtServiceTest {

    private JwtService jwtService;
    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "testSecretKey12345678901234567890");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L);
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setRole(Role.ADMIN);
    }

    @Test
    @DisplayName("Génération : Le token contient bien l'ID et le rôle")
    void generateTokenSuccess() {
        String token = jwtService.generateToken(user);
        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtService.extractRole(token)).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Validation : Un token valide est correctement décodé")
    void validateTokenSuccess() {
        String token = jwtService.generateToken(user);
        DecodedJWT decodedJWT = jwtService.validateAndDecodeToken(token);
        assertThat(decodedJWT).isNotNull();
        assertThat(decodedJWT.getSubject()).isEqualTo(userId.toString());
    }

    @Test
    @DisplayName("Validation : Un token corrompu est rejeté")
    void validateTokenFail() {
        String corruptToken = "eyAiYWxnIjogIkhTMjU2IiwgInR5cCI6ICJKV1QiIH0.corrupt.data";
        DecodedJWT decodedJWT = jwtService.validateAndDecodeToken(corruptToken);
        assertThat(decodedJWT).isNull();
    }
}
