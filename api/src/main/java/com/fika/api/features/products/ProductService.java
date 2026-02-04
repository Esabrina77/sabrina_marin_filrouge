package com.fika.api.features.products;

import com.fika.api.core.exceptions.product.ProductNotFoundException;
import com.fika.api.features.products.dto.ProductRequest;
import com.fika.api.features.products.dto.ProductResponse;
import com.fika.api.features.products.model.Product;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service gérant la logique métier des produits du café Fika.
 * <p>
 * Ce service assure la gestion du catalogue (CRUD) et la transformation
 * entre les entités persistantes et les DTO de réponse.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    /**
     * Récupère la liste paginée de tous les produits.
     *
     * @param pageable informations de pagination et de tri
     * @return une page de {@link ProductResponse}
     */
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(productMapper::toResponse);
    }

    /**
     * Récupère un produit spécifique par son identifiant unique.
     *
     * @param id l'UUID du produit recherché
     * @return le DTO du produit trouvé
     * @throws ProductNotFoundException si aucun produit ne correspond à l'ID
     */
    public ProductResponse getProductById(UUID id)  {
        return productRepository.findById(id)
                .map(productMapper::toResponse)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    /**
     * Crée et enregistre un nouveau produit dans le catalogue.
     *
     * @param productRequest les données du produit à créer
     * @return le produit créé avec son ID et ses dates d'audit généré
     */
    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest) {
        Product productToSave = productMapper.toEntity(productRequest);
        Product savedProduct = productRepository.save(productToSave);
        return productMapper.toResponse(savedProduct);
    }

    /**
     * Met à jour un produit existant.
     * <p>
     * Utilise le mécanisme de dirty checking d'Hibernate pour synchroniser
     * les modifications avec la base de données.
     *
     * @param productRequest les nouvelles données à appliquer
     * @param id l'identifiant du produit à modifier
     * @return le produit mis à jour
     * @throws ProductNotFoundException si le produit n'existe pas
     */
    @Transactional
    public ProductResponse updateProduct(ProductRequest productRequest, UUID id) {
        Product productToUpdate = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        productToUpdate.setName(productRequest.name());
        productToUpdate.setPrice(productRequest.price());
        productToUpdate.setDescription(productRequest.description());
        productToUpdate.setImgUrl(productRequest.imgUrl());
        productToUpdate.setCategory(productRequest.category());
        productToUpdate.setAvailable(productRequest.available());

        productRepository.save(productToUpdate);
        return productMapper.toResponse(productToUpdate);
    }

    /**
     * Supprime un produit du catalogue.
     *
     * @param id l'identifiant du produit à supprimer
     * @throws ProductNotFoundException si l'identifiant est invalide
     */
    @Transactional
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }
}