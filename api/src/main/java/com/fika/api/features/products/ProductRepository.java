package com.fika.api.features.products;

import com.fika.api.features.products.model.Category;
import com.fika.api.features.products.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
        boolean existsByName(String name);

        @Query("SELECT p FROM Product p WHERE " +
                        "(CAST(:name AS string) IS NULL OR LOWER(p.name) LIKE LOWER(CAST(:name AS string))) AND " +
                        "(:category IS NULL OR p.category = :category) AND " +
                        "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
                        "(:onlyAvailable IS NULL OR p.available = :onlyAvailable)")
        Page<Product> findWithFilters(
                        @Param("name") String name,
                        @Param("category") Category category,
                        @Param("minPrice") BigDecimal minPrice,
                        @Param("maxPrice") BigDecimal maxPrice,
                        @Param("onlyAvailable") Boolean onlyAvailable,
                        Pageable pageable);
}
