package com.fika.api.core.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fika.api.features.users.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * Service gérant la génération et la validation des jetons JWT (JSON Web
 * Tokens).
 * <p>
 * Ce service permet de créer des jetons d'accès contenant les informations de
 * l'utilisateur (email, rôle) et de les valider lors des requêtes entrantes.
 * </p>
 */
@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    /**
     * Génère un nouveau jeton d'accès (Access Token) pour un utilisateur.
     *
     * @param user L'utilisateur pour lequel générer le jeton.
     * @return Le jeton JWT sous forme de chaîne de caractères.
     */
    public String generateToken(User user) {
        return JWT.create()
                .withSubject(user.getEmail())
                .withClaim("role", user.getRole().name())
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + jwtExpiration))
                .sign(Algorithm.HMAC256(secretKey));
    }

    /**
     * Valide un jeton JWT et retourne son contenu décodé.
     *
     * @param token Le jeton à vérifier.
     * @return Un {@link DecodedJWT} si le jeton est valide, sinon {@code null}.
     */
    public DecodedJWT validateAndDecodeToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            JWTVerifier verifier = JWT.require(algorithm).build();
            return verifier.verify(token);
        } catch (JWTVerificationException exception) {
            return null;
        }
    }

    /**
     * Extrait l'email (subject) d'un jeton JWT.
     *
     * @param token Le jeton JWT.
     * @return L'email de l'utilisateur ou {@code null} si le jeton est invalide.
     */
    public String extractUsername(String token) {
        DecodedJWT decodedJWT = validateAndDecodeToken(token);
        return decodedJWT != null ? decodedJWT.getSubject() : null;
    }

    /**
     * Extrait le rôle d'un jeton JWT.
     *
     * @param token Le jeton JWT.
     * @return Le rôle sous forme de chaîne ou {@code null} si le jeton est
     *         invalide.
     */
    public String extractRole(String token) {
        DecodedJWT decodedJWT = validateAndDecodeToken(token);
        return decodedJWT != null ? decodedJWT.getClaim("role").asString() : null;
    }
}
