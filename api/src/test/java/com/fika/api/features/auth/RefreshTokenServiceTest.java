package com.fika.api.features.auth;

import com.fika.api.core.exceptions.auth.RefreshTokenExpiredException;
import com.fika.api.features.auth.model.RefreshToken;
import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service : RefreshToken")
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User user;
    private RefreshToken refreshToken;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", 604800000L);
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");

        refreshToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(Instant.now().plusMillis(604800000L))
                .build();
    }

    @Test
    @DisplayName("Création : Succès et rotation")
    void createRefreshTokenSuccess() {
        given(refreshTokenRepository.findByUser(user)).willReturn(Optional.of(refreshToken));
        given(refreshTokenRepository.save(any(RefreshToken.class))).willReturn(refreshToken);
        RefreshToken result = refreshTokenService.createRefreshToken(user);
        assertThat(result).isNotNull();
        verify(refreshTokenRepository).delete(refreshToken);
        verify(refreshTokenRepository).flush();
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Vérification : Succès si non expiré")
    void verifyExpirationSuccess() {
        RefreshToken result = refreshTokenService.verifyExpiration(refreshToken);
        assertThat(result).isEqualTo(refreshToken);
    }

    @Test
    @DisplayName("Vérification : Échec si expiré")
    void verifyExpirationFail() {
        refreshToken.setExpiryDate(Instant.now().minusMillis(1000));
        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(refreshToken))
                .isInstanceOf(RefreshTokenExpiredException.class);
        verify(refreshTokenRepository).delete(refreshToken);
    }

    @Test
    @DisplayName("Suppression : Par ID utilisateur")
    void deleteByUserId() {
        given(userRepository.findById(user.getId())).willReturn(Optional.of(user));
        given(refreshTokenRepository.findByUser(user)).willReturn(Optional.of(refreshToken));
        refreshTokenService.deleteByUserId(user.getId());
        verify(refreshTokenRepository).delete(refreshToken);
    }
}
