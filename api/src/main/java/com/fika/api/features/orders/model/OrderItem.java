package com.fika.api.features.orders.model;

import com.fika.api.features.products.model.Product;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entité représentant un article spécifique au sein d'une commande.
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    /**
     * Identifiant technique de l'article.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID technique de l'article", example = "1")
    private Long id;

    /**
     * Commande à laquelle cet article appartient.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * Produit commandé.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Quantité commandée.
     */
    @Column(nullable = false)
    @Schema(description = "Quantité du produit", example = "2")
    private Integer quantity;

    /**
     * Prix du produit au moment de la commande (pour historisation).
     */
    @Column(nullable = false, precision = 10, scale = 2)
    @Schema(description = "Prix unitaire au moment de la commande", example = "4.50")
    private BigDecimal priceAtReservation;
}