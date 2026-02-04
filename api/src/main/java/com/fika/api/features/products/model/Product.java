package com.fika.api.features.products.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Entité représentant un produit (boisson, plat, pâtisserie) du café Fika.
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@Builder
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    /**
     * Identifiant unique du produit.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Schema(description = "ID unique du produit", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    /**
     * Nom du produit.
     */
    @Column(nullable = false)
    @Schema(description = "Nom du produit", example = "Espresso")
    private String name;

    /**
     * Prix unitaire.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    @Schema(description = "Prix du produit", example = "2.50")
    private BigDecimal price;

    /**
     * Description détaillée.
     */
    @Column(nullable = false, length = 1000)
    @Schema(description = "Description du produit", example = "Un café intense et aromatique.")
    private String description;

    /**
     * URL de l'image représentative.
     */
    @Column(nullable = false)
    @Schema(description = "URL de l'image", example = "https://example.com/espresso.jpg")
    private String imgUrl;

    /**
     * Catégorie du produit.
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Schema(description = "Catégorie", example = "DESSERT")
    private Category category;

    /**
     * Disponibilité en stock.
     */
    @Column(nullable = false)
    @Schema(description = "Disponibilité", example = "true")
    private boolean available;

    /**
     * Date de création automatique.
     */
    @Column(nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    /**
     * Date de mise à jour automatique.
     */
    @Column(insertable = false)
    @LastModifiedDate
    private Instant updatedAt;
}
