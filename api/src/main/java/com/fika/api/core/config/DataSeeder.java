package com.fika.api.core.config;

import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import com.fika.api.features.products.ProductRepository;
import com.fika.api.features.products.model.Category;
import com.fika.api.features.products.model.Product;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

/**
 * Composant responsable de l'initialisation des données (seeding) au démarrage
 * de
 * l'application.
 * <p>
 * Crée automatiquement des comptes administrateurs par défaut si la base de
 * données est vide ou si ces comptes n'existent pas encore.
 * </p>
 */
@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String @NonNull... args) {
        if (!userRepository.existsByEmail("marin@example.com")) {
            User admin = User.builder()
                    .firstName("Marin")
                    .lastName("Harel")
                    .email("marin@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
        if (!userRepository.existsByEmail("sabrina@example.com")) {
            User admin = User.builder()
                    .firstName("Sabrina")
                    .lastName("Eloundou")
                    .email("sabrina@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }

        seedProducts();
    }

    private void seedProducts() {
        if (!productRepository.existsByName("Salade César")) {
            productRepository.save(Product.builder()
                    .name("Salade César")
                    .price(new BigDecimal("12.50"))
                    .description("Salade romaine, poulet grillé, croûtons, parmesan et sauce César.")
                    .imgUrl("https://images.unsplash.com/photo-1550304943-4f24f54ddde9")
                    .category(Category.ENTREE)
                    .available(true)
                    .build());
        }

        if (!productRepository.existsByName("Burger Maison")) {
            productRepository.save(Product.builder()
                    .name("Burger Maison")
                    .price(new BigDecimal("18.90"))
                    .description("Pain brioché, steak haché black angus, cheddar, oignons caramélisés et frites.")
                    .imgUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd")
                    .category(Category.PLAT)
                    .available(true)
                    .build());
        }

        if (!productRepository.existsByName("Moelleux au Chocolat")) {
            productRepository.save(Product.builder()
                    .name("Moelleux au Chocolat")
                    .price(new BigDecimal("8.00"))
                    .description("Cœur coulant chocolat noir 70%, servi avec une boule de glace vanille.")
                    .imgUrl("https://images.unsplash.com/photo-1624353365286-3f8d62adda51")
                    .category(Category.DESSERT)
                    .available(true)
                    .build());
        }
    }
}
