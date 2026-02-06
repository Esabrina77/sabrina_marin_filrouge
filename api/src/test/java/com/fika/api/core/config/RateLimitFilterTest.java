package com.fika.api.core.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("Core : Rate Limiting")
class RateLimitFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("RateLimit : Bloque après trop de requêtes sur une route protégée")
    void rateLimitTriggered() throws Exception {
        String uniqueIp = UUID.randomUUID().toString();

        for (int i = 0; i < 30; i++) {
            mockMvc.perform(get("/api/v1/products").remoteAddress(uniqueIp))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(get("/api/v1/products").remoteAddress(uniqueIp))
                .andDo(print())
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.error").value("Too Many Requests"))
                .andExpect(jsonPath("$.message").value("Trop de requêtes. Veuillez ralentir."));
    }
}
