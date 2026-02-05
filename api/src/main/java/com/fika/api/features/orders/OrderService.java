package com.fika.api.features.orders;

import com.fika.api.core.dto.PagedResponse;
import com.fika.api.core.exceptions.order.OrderNotFoundException;
import com.fika.api.core.exceptions.product.ProductNotFoundException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.orders.dto.OrderItemRequest;
import com.fika.api.features.orders.dto.OrderRequest;
import com.fika.api.features.orders.dto.OrderResponse;
import com.fika.api.features.orders.mapper.OrderMapper;
import com.fika.api.features.orders.model.Order;
import com.fika.api.features.orders.model.OrderItem;
import com.fika.api.features.orders.model.OrderStatus;
import com.fika.api.features.orders.repository.OrderRepository;
import com.fika.api.features.products.ProductRepository;
import com.fika.api.features.products.model.Product;
import com.fika.api.features.users.UserRepository;
import com.fika.api.features.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Random;
import java.util.UUID;

/**
 * Service gérant la logique métier des commandes.
 * Permet la création, la récupération et le suivi des commandes clients.
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private static final Random RANDOM = new Random();

    /**
     * Récupère toutes les commandes enregistrées (réservé aux admins).
     * 
     * @param pageable Pagination et tri.
     * @return PagedResponse de toutes les commandes.
     */
    public PagedResponse<OrderResponse> getAllOrders(Pageable pageable) {
        Page<OrderResponse> orderPage = orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(orderMapper::toResponse);
        return PagedResponse.of(orderPage);
    }

    /**
     * Récupère les commandes filtrées par statut, triées de la plus ancienne à la
     * plus récente.
     * Utile pour l'affichage en cuisine (First In, First Out).
     * 
     * @param status   Le statut des commandes à rechercher (ex: PENDING,
     *                 PREPARING).
     * @param pageable Pagination et tri.
     * @return PagedResponse de {@link OrderResponse} correspondantes.
     */
    public PagedResponse<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        Page<OrderResponse> orderPage = orderRepository.findAllByStatusOrderByCreatedAtAsc(status, pageable)
                .map(orderMapper::toResponse);
        return PagedResponse.of(orderPage);
    }

    /**
     * Récupère l'historique des commandes d'un utilisateur par son email.
     * 
     * @param email    L'email de l'utilisateur.
     * @param pageable Pagination et tri.
     * @return PagedResponse des commandes de l'utilisateur ordonnées par date
     *         décroissante.
     */
    public PagedResponse<OrderResponse> getOrderByUserMail(String email, Pageable pageable) {
        Page<OrderResponse> orderPage = orderRepository.findByUserEmailOrderByCreatedAtDesc(email, pageable)
                .map(orderMapper::toResponse);
        return PagedResponse.of(orderPage);
    }

    /**
     * Récupère une commande par son identifiant unique avec vérification des
     * droits.
     * 
     * @param id               L'UUID de la commande.
     * @param currentUserEmail L'email de l'utilisateur courant (pour vérification
     *                         de propriété).
     * @param isAdmin          Booléen indiquant si l'utilisateur est admin.
     * @return La commande si trouvée et autorisée.
     * @throws OrderNotFoundException si la commande n'existe pas.
     * @throws AccessDeniedException  si l'utilisateur n'est pas le propriétaire ni
     *                                admin.
     */
    public OrderResponse getOrderById(UUID id, String currentUserEmail, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        if (!isAdmin && !order.getUser().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException(
                    "Vous n'avez pas l'autorisation de consulter cette commande.");
        }
        return orderMapper.toResponse(order);
    }

    /**
     * Crée une nouvelle commande pour l'utilisateur connecté.
     * Calcule automatiquement le montant total basé sur le prix actuel des
     * produits.
     * 
     * @param orderRequest Les détails de la commande (articles et quantités).
     * @param email        L'email de l'utilisateur passant la commande.
     * @return La commande créée.
     * @throws UserNotFoundException    si l'utilisateur n'existe pas.
     * @throws ProductNotFoundException si l'un des produits commandés est
     *                                  introuvable.
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        Order order = Order.builder()
                .user(user)
                .orderReference(generateUniqueReference())
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : orderRequest.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ProductNotFoundException(itemReq.productId().toString()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.quantity())
                    .priceAtReservation(product.getPrice())
                    .build();

            BigDecimal subTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalAmount = totalAmount.add(subTotal);
            order.addItem(orderItem);
        }
        order.setTotal(totalAmount);
        Order savedOrder = orderRepository.saveAndFlush(order);
        return orderMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse changeOrderStatus(UUID id, OrderStatus orderStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        order.setStatus(orderStatus);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Génère une référence de commande unique et aléatoire de 4 caractères.
     * 
     * @return Une chaîne de caractères unique.
     */
    private String generateUniqueReference() {
        String characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder stringBuilder = new StringBuilder();
        String code;
        do {
            stringBuilder.setLength(0);
            for (int i = 0; i < 4; i++) {
                stringBuilder.append(characters.charAt(RANDOM.nextInt(characters.length())));
            }
            code = stringBuilder.toString();
        } while (orderRepository.existsByOrderReference(code));
        return code;
    }

}
