package com.fika.api.features.auth;

import com.fika.api.core.jwt.JwtService;
import com.fika.api.features.auth.dto.LoginRequest;
import com.fika.api.features.auth.dto.LoginResponse;
import com.fika.api.features.auth.dto.RegisterRequest;
import com.fika.api.features.users.UserService;
import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.model.User;
import com.fika.api.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service gérant la logique métier liée à l'authentification.
 * Ce service s'occupe de la validation des identifiants et de la génération des
 * réponses de connexion/inscription.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;
    private final UserService userService;
    private final JwtService jwtService;

    /**
     * Authentifie un utilisateur en vérifiant son email et son mot de passe.
     *
     * @param loginRequest Les informations de connexion fournies par l'utilisateur.
     * @return Une réponse contenant les détails de l'utilisateur et un jeton
     *         d'authentification.
     * @throws BadCredentialsException Si l'email n'existe pas ou si le mot de passe
     *                                 est incorrect.
     */
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new BadCredentialsException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        }
        String token = jwtService.generateToken(user);
        return authMapper.toResponse(user, token);
    }

    /**
     * Inscrit un nouvel utilisateur dans le système.
     *
     * @param registerRequest Les informations d'inscription fournies par
     *                        l'utilisateur.
     * @return Une réponse contenant les détails de l'utilisateur créé et un jeton
     *         d'authentification.
     * @throws com.fika.api.core.exceptions.user.EmailAlreadyExistsException Si
     *                                                                       l'email
     *                                                                       est
     *                                                                       déjà
     *                                                                       utilisé
     *                                                                       (via
     *                                                                       userService.createUser).
     */
    public LoginResponse register(RegisterRequest registerRequest) {
        UserRequest userRequest = new UserRequest(
                registerRequest.firstName(),
                registerRequest.lastName(),
                registerRequest.email(),
                registerRequest.password());

        User user = userService.createUser(userRequest);
        String token = jwtService.generateToken(user);

        return authMapper.toResponse(user, token);
    }
}
