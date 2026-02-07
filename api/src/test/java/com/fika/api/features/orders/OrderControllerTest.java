package com.fika.api.features.orders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fika.api.core.dto.PagedResponse;
import com.fika.api.features.orders.dto.OrderItemRequest;
import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.orders.dto.OrderResponse;
import com.fika.api.features.orders.model.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Controller : Gestion des commandes")
class OrderControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private OrderService orderService;

        @MockitoBean
        private com.fika.api.core.jwt.JwtService jwtService;

        @MockitoBean
        private com.fika.api.core.jwt.JwtFilter jwtFilter;

        @MockitoBean
        private com.fika.api.core.config.RateLimitFilter rateLimitFilter;

        @MockitoBean
        private com.fika.api.core.exceptions.JwtExceptionHandler jwtExceptionHandler;

        private final ObjectMapper objectMapper = new ObjectMapper()
                        .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

        private OrderResponse orderResponse;
        private UUID orderId;

        @BeforeEach
        void setUp() {
                orderId = UUID.randomUUID();
                orderResponse = new OrderResponse(orderId, "ABCD", new BigDecimal("15.50"), OrderStatus.PENDING, null,
                                "John",
                                "Doe", "john.doe@email.com", null);
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("GetAll : Liste toutes les commandes (ADMIN)")
        void getAllOrders() throws Exception {
                Page<OrderResponse> page = new PageImpl<>(List.of(orderResponse));
                PagedResponse<OrderResponse> pagedResponse = PagedResponse.of(page);
                given(orderService.getAllOrders(any(Pageable.class))).willReturn(pagedResponse);

                mockMvc.perform(get("/api/v1/orders"))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].orderReference").value("ABCD"))
                                .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @DisplayName("GetMyOrders : Liste mes commandes")
        void getMyOrders() throws Exception {
                Page<OrderResponse> page = new PageImpl<>(List.of(orderResponse));
                PagedResponse<OrderResponse> pagedResponse = PagedResponse.of(page);
                UUID userId = UUID.randomUUID();
                given(orderService.getOrderByUserId(any(), any())).willReturn(pagedResponse);

                mockMvc.perform(get("/api/v1/orders/my-order")
                                .with(authentication(new UsernamePasswordAuthenticationToken(userId, null,
                                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].orderReference").value("ABCD"))
                                .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @DisplayName("GetOne : Récupère une commande par ID")
        void getOrderById() throws Exception {
                UUID userId = UUID.randomUUID();
                given(orderService.getOrderById(eq(orderId), any(), anyBoolean())).willReturn(orderResponse);

                mockMvc.perform(get("/api/v1/orders/{id}", orderId)
                                .with(authentication(new UsernamePasswordAuthenticationToken(userId, null,
                                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.orderReference").value("ABCD"));
        }

        @Test
        @DisplayName("Create : Création d'une commande")
        void createOrder() throws Exception {
                OrderItemRequest item = new OrderItemRequest(UUID.randomUUID(), 1);
                OrderRequest orderRequest = new OrderRequest(List.of(item));
                UUID userId = UUID.randomUUID();
                given(orderService.createOrder(any(OrderRequest.class), any())).willReturn(orderResponse);

                mockMvc.perform(post("/api/v1/orders")
                                .with(csrf())
                                .with(authentication(new UsernamePasswordAuthenticationToken(userId, null,
                                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(orderRequest)))
                                .andDo(print())
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.orderReference").value("ABCD"));
        }

        @Test
        @DisplayName("GetLatest : Récupère la dernière commande active")
        void getLatestOrder() throws Exception {
                UUID userId = UUID.randomUUID();
                given(orderService.getLatestActiveOrder(any())).willReturn(orderResponse);

                mockMvc.perform(get("/api/v1/orders/latest")
                                .with(authentication(new UsernamePasswordAuthenticationToken(userId, null,
                                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.orderReference").value("ABCD"));
        }

        @Test
        @DisplayName("Cancel : Annulation d'une commande")
        void cancelOrder() throws Exception {
                UUID userId = UUID.randomUUID();
                given(orderService.cancelOrder(eq(orderId), any())).willReturn(orderResponse);

                mockMvc.perform(patch("/api/v1/orders/{id}/cancel", orderId)
                                .with(csrf())
                                .with(authentication(new UsernamePasswordAuthenticationToken(userId, null,
                                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("PENDING"));
        }
}
