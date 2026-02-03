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

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    public String generateToken(User user) {
        return JWT.create()
                .withSubject(user.getEmail())
                .withClaim("role", user.getRole().name())
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + jwtExpiration))
                .sign(Algorithm.HMAC256(secretKey));
    }

    public DecodedJWT validateAndDecodeToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            JWTVerifier verifier = JWT.require(algorithm).build();
            return verifier.verify(token);
        } catch (JWTVerificationException exception) {
            return null;
        }
    }

    public String extractUsername(String token) {
        DecodedJWT decodedJWT = validateAndDecodeToken(token);
        return decodedJWT != null ? decodedJWT.getSubject() : null;
    }

    public String extractRole(String token) {
        DecodedJWT decodedJWT = validateAndDecodeToken(token);
        return decodedJWT != null ? decodedJWT.getClaim("role").asString() : null;
    }
}
