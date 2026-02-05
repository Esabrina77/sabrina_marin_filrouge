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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
        orderResponse = new OrderResponse(orderId, "ABCD", new BigDecimal("15.50"), OrderStatus.PENDING, null, "John",
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
    @WithMockUser(username = "user")
    @DisplayName("GetMyOrders : Liste mes commandes")
    void getMyOrders() throws Exception {
        Page<OrderResponse> page = new PageImpl<>(List.of(orderResponse));
        PagedResponse<OrderResponse> pagedResponse = PagedResponse.of(page);
        given(orderService.getOrderByUserMail(any(), any())).willReturn(pagedResponse);

        mockMvc.perform(get("/api/v1/orders/my-order"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].orderReference").value("ABCD"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(username = "user")
    @DisplayName("GetOne : Récupère une commande par ID")
    void getOrderById() throws Exception {
        given(orderService.getOrderById(eq(orderId), any(), anyBoolean())).willReturn(orderResponse);

        mockMvc.perform(get("/api/v1/orders/{id}", orderId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderReference").value("ABCD"));
    }

    @Test
    @WithMockUser(username = "user")
    @DisplayName("Create : Création d'une commande")
    void createOrder() throws Exception {
        OrderItemRequest item = new OrderItemRequest(UUID.randomUUID(), 1);
        OrderRequest orderRequest = new OrderRequest(List.of(item));
        given(orderService.createOrder(any(OrderRequest.class), any())).willReturn(orderResponse);

        mockMvc.perform(post("/api/v1/orders")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderReference").value("ABCD"));
    }
}
