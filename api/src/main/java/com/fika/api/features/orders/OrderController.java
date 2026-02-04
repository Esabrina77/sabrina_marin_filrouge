package com.fika.api.features.orders;

import com.fika.api.features.orders.dto.OrderResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
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
    public List<OrderResponse> getMyOrder(@AuthenticationPrincipal String email) {
        return orderService.getOrderByUserMail(email);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable UUID id) {
        return orderService.getOrderById(id);
    }
}
