package com.fika.api.features.products.repository;

import com.fika.api.features.products.ProductRepository;
import com.fika.api.features.products.model.Category;
import com.fika.api.features.products.model.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import com.fika.api.features.orders.repository.OrderRepository;
import com.fika.api.features.orders.repository.OrderItemRepository;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@DisplayName("Repository : Produits (Filtres)")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @BeforeEach
    @Transactional
    void setUp() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        productRepository.deleteAll();

        productRepository.saveAll(List.of(
                Product.builder().name("Café Noir").price(new BigDecimal("2.00"))
                        .category(Category.ENTREE)
                        .description("D").imgUrl("U").quantity(100).available(true).build(),
                Product.builder().name("Thé Vert").price(new BigDecimal("3.00"))
                        .category(Category.ENTREE)
                        .description("D").imgUrl("U").quantity(0).available(true).build(),
                Product.builder().name("Sandwich Jambon").price(new BigDecimal("5.50"))
                        .category(Category.PLAT)
                        .description("D").imgUrl("U").quantity(10).available(true).build(),
                Product.builder().name("Salade César").price(new BigDecimal("7.00"))
                        .category(Category.PLAT)
                        .description("D").imgUrl("U").quantity(20).available(false).build(),
                Product.builder().name("Cookie").price(new BigDecimal("1.50"))
                        .category(Category.DESSERT)
                        .description("D").imgUrl("U").quantity(50).available(true).build()));
    }

    @Test
    @DisplayName("Filter : Recherche par nom (insensible à la casse)")
    void findByName() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findWithFilters("%caf%", null, null, null, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Café Noir");
    }

    @Test
    @DisplayName("Filter : Recherche par catégorie")
    void findByCategory() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findWithFilters(null, Category.ENTREE, null, null, null,
                pageable);

        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    @DisplayName("Filter : Recherche par gamme de prix")
    void findByPriceRange() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findWithFilters(null, null, new BigDecimal("2.00"),
                new BigDecimal("4.00"), null, pageable);

        assertThat(result.getContent()).hasSize(2); // Café(2.00) et Thé(3.00)
    }

    @Test
    @DisplayName("Filter : Uniquement les produits disponibles")
    void findOnlyAvailable() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findWithFilters(null, null, null, null, true, pageable);

        assertThat(result.getContent()).hasSize(4);
        assertThat(result.getContent()).noneMatch(p -> p.getName().equals("Salade César"));
    }

    @Test
    @DisplayName("Filter : Combinaison de plusieurs filtres")
    void findWithMultipleFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findWithFilters(null, Category.PLAT, new BigDecimal("5.00"),
                new BigDecimal("6.00"), true, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Sandwich Jambon");
    }
}
