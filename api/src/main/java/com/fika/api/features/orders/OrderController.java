package com.fika.api.features.orders;

import com.fika.api.core.dto.PagedResponse;
import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.orders.dto.OrderResponse;
import com.fika.api.features.orders.model.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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
    public PagedResponse<OrderResponse> getAllOrders(@ParameterObject @PageableDefault(size = 12) Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @GetMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les commandes par statut (Admin ONLY)", description = "Filtre les commandes selon le statut passé en paramètre (PENDING, READY, etc.).")
    public PagedResponse<OrderResponse> getOrdersByStatus(@RequestParam OrderStatus status,
            @ParameterObject @PageableDefault(size = 12) Pageable pageable) {
        return orderService.getOrdersByStatus(status, pageable);
    }

    @GetMapping("/my-order")
    @Operation(summary = "Récupérer mes commandes (Authentifié)")
    public PagedResponse<OrderResponse> getMyOrder(@AuthenticationPrincipal String email,
            @ParameterObject @PageableDefault(size = 12) Pageable pageable) {
        return orderService.getOrderByUserMail(email, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une commande par ID (Authentifié/Admin)", description = "Récupère les détails d'une commande. L'utilisateur doit être le propriétaire ou un administrateur.")
    public OrderResponse getOrderById(@PathVariable UUID id, @AuthenticationPrincipal String email) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));
        return orderService.getOrderById(id, email, isAdmin);
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une commande (Authentifié)")
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest orderRequest,
            @AuthenticationPrincipal String email) {
        return orderService.createOrder(orderRequest, email);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Changer le statut (Admin ONLY)", description = "Permet de passer une commande à READY, COMPLETED, etc.")
    public OrderResponse updateStatus(@PathVariable UUID id, @RequestParam OrderStatus status) {
        return orderService.changeOrderStatus(id, status);
    }

    @GetMapping("/latest")
    @Operation(summary = "Dernière commande active (Authentifié)", description = "Récupère la commande en cours (PENDING ou READY) la plus récente de l'utilisateur.")
    public OrderResponse getLatestOrder(@AuthenticationPrincipal String email) {
        return orderService.getLatestActiveOrder(email);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Annuler une commande (Authentifié)", description = "Permet à l'utilisateur d'annuler sa propre commande si elle est encore au statut PENDING.")
    public OrderResponse cancelOrder(@PathVariable UUID id, @AuthenticationPrincipal String email) {
        return orderService.cancelOrder(id, email);
    }
}
