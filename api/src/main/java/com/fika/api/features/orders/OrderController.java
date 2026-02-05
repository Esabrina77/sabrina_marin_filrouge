package com.fika.api.features.orders;

import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.orders.dto.OrderResponse;
import com.fika.api.features.orders.model.OrderStatus;
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
    @Operation(summary = "Lister toutes les commandes (Admin ONLY)", description = "Récupère l'intégralité des commandes passées sur la plateforme.")
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les commandes par statut (Admin ONLY)", description = "Filtre les commandes selon le statut passé en paramètre (PENDING, READY, etc.).")
    public List<OrderResponse> getOrdersByStatus(@RequestParam OrderStatus status) {
        return orderService.getOrdersByStatus(status);
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

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Changer le statut (ADMIN)", description = "Permet de passer une commande à READY, COMPLETED, etc.")
    public OrderResponse updateStatus(@PathVariable UUID id, @RequestParam OrderStatus status) {
        return orderService.changeOrderStatus(id, status);
    }
}
