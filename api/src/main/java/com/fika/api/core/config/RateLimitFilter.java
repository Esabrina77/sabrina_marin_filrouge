package com.fika.api.core.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> cache;

    public RateLimitFilter() {
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws IOException, ServletException {

        String ip = request.getRemoteAddr();
        String path = request.getRequestURI();

        if (path.startsWith("/api/v1/auth/login")) {
            Bucket bucket = cache.get("login:" + ip, this::createNewAuthBucket);
            if (!bucket.tryConsume(1)) {
                sendErrorResponse(response);
                return;
            }
        } else if (path.startsWith("/api/v1/auth/register")) {
            Bucket bucket = cache.get("register:" + ip, this::createNewAuthBucket);
            if (!bucket.tryConsume(1)) {
                sendErrorResponse(response);
                return;
            }
        } else if (path.startsWith("/api/v1")) {
            Bucket bucket = cache.get("api:" + ip, this::createNewApiBucket);
            if (!bucket.tryConsume(1)) {
                sendErrorResponse(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response) throws IOException {
        String timestamp = java.time.LocalDateTime.now().toString();
        response.setStatus(429);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format(
                "{\"timestamp\": \"%s\", \"status\": 429, \"error\": \"Too Many Requests\", \"message\": \"Trop de requêtes. Veuillez ralentir.\"}",
                timestamp));
    }

    private Bucket createNewAuthBucket(String key) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(10)
                        .refillIntervally(10, Duration.ofMinutes(1))
                        .initialTokens(10)
                        .build())
                .build();
    }

    private Bucket createNewApiBucket(String key) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(30)
                        .refillIntervally(30, Duration.ofMinutes(1))
                        .initialTokens(30)
                        .build())
                .build();
    }
}
