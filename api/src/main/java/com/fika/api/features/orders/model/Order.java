package com.fika.api.features.orders.model;

import com.fika.api.features.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Entité représentant une commande dans le système.
 */
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    /**
     * Identifiant unique de la commande.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Schema(description = "ID unique de la commande", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    /**
     * Référence lisible de la commande (ex: AB12).
     */
    @Column(unique = true, nullable = false)
    @Schema(description = "Référence courte de la commande", example = "XJ8K")
    private String orderReference;

    /**
     * Utilisateur ayant passé la commande.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Liste des articles inclus dans la commande.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    /**
     * Montant total de la commande.
     */
    @Column(nullable = false)
    @Schema(description = "Montant total de la commande", example = "15.50")
    private BigDecimal total;

    /**
     * Statut actuel de la commande.
     */
    @Enumerated(EnumType.STRING)
    @Schema(description = "Statut de la commande", example = "PENDING")
    private OrderStatus status;

    /**
     * Date de création de la commande.
     */
    @Column(nullable = false, updatable = false)
    @CreatedDate
    @Schema(description = "Date de création")
    private Instant createdAt;

    /**
     * Date de dernière mise à jour.
     */
    @LastModifiedDate
    @Schema(description = "Date de mise à jour")
    private Instant updatedAt;

    /**
     * Ajoute un article à la commande et gère la relation bidirectionnelle.
     * 
     * @param item L'article à ajouter.
     */
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
