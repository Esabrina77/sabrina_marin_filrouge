package com.fika.api.features.orders;

import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.orders.dto.OrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Gestion des commandes")
public class OrderController {

    private final OrderService orderService;

    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderResponse> getAllOrder() {
        return orderService.getAllOrders();
    }

    @GetMapping("/my-order")
    @Operation(summary = "Récupérer mes commandes")
    public List<OrderResponse> getMyOrder(@AuthenticationPrincipal String email) {
        return orderService.getOrderByUserMail(email);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une commande par ID")
    public OrderResponse getOrderById(@PathVariable UUID id, @AuthenticationPrincipal String email) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));
        return orderService.getOrderById(id, email, isAdmin);
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une commande")
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest orderRequest,
            @AuthenticationPrincipal String email) {
        return orderService.createOrder(orderRequest, email);
    }
}
