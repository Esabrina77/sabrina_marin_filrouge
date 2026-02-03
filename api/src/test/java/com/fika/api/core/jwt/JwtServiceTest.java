package com.fika.api.core.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Service : JWT")
class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "testSecretKey12345678901234567890");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L);
        user = new User();
        user.setEmail("test@example.com");
        user.setRole(Role.ADMIN);
    }

    @Test
    @DisplayName("Génération : Le token contient bien l'email et le rôle")
    void generateTokenSuccess() {
        String token = jwtService.generateToken(user);
        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("test@example.com");
        assertThat(jwtService.extractRole(token)).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Validation : Un token valide est correctement décodé")
    void validateTokenSuccess() {
        String token = jwtService.generateToken(user);
        DecodedJWT decodedJWT = jwtService.validateAndDecodeToken(token);
        assertThat(decodedJWT).isNotNull();
        assertThat(decodedJWT.getSubject()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Validation : Un token corrompu est rejeté")
    void validateTokenFail() {
        String corruptToken = "eyAiYWxnIjogIkhTMjU2IiwgInR5cCI6ICJKV1QiIH0.corrupt.data";
        DecodedJWT decodedJWT = jwtService.validateAndDecodeToken(corruptToken);
        assertThat(decodedJWT).isNull();
    }
}
