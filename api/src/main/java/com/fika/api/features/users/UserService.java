package com.fika.api.features.users;

import com.fika.api.core.dto.PagedResponse;
import com.fika.api.features.users.dto.UserProfileRequest;
import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.core.exceptions.user.EmailAlreadyExistsException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.users.model.Role;
import com.fika.api.features.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

/**
 * Service gérant la logique métier liée aux utilisateurs.
 * Assure la coordination entre le repository, le mapper et les règles métier.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Récupère une page d'utilisateurs enregistrés.
     *
     * @param pageable Les informations de pagination et de tri.
     * @return Une PagedResponse de UserResponse.
     */
    public PagedResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<UserResponse> userPage = userRepository.findAll(pageable)
                .map(userMapper::toResponse);
        return PagedResponse.of(userPage);
    }

    /**
     * Récupère un utilisateur par son identifiant unique avec vérification des
     * droits.
     *
     * @param id L'UUID de l'utilisateur recherché.
     * @return Le DTO de l'utilisateur trouvé.
     * @throws UserNotFoundException si aucun utilisateur n'existe avec cet ID.
     */
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return userMapper.toResponse(user);
    }

    /**
     * Crée un nouvel utilisateur après avoir vérifié que l'email est unique.
     *
     * @param userRequest Le DTO contenant les informations de création.
     * @return Le DTO de l'utilisateur créé avec son ID généré.
     * @throws EmailAlreadyExistsException si l'email est déjà utilisé en base.
     */
    @Transactional
    public UserResponse createUser(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.email())) {
            throw new EmailAlreadyExistsException("L'email " + userRequest.email() + " est déjà utilisé.");
        }
        User userToCreate = userMapper.toEntity(userRequest);
        userToCreate.setPassword(passwordEncoder.encode(userRequest.password()));
        User savedUser = userRepository.save(userToCreate);
        return userMapper.toResponse(savedUser);
    }

    /**
     * Met à jour les informations d'un utilisateur existant.
     * <p>
     * Cette méthode vérifie d'abord l'existence de l'utilisateur. Si l'email est
     * modifié,
     * elle s'assure que le nouvel email n'est pas déjà utilisé par un autre compte.
     * </p>
     *
     * @param id          L'identifiant unique de l'utilisateur à modifier.
     * @param userRequest Le DTO contenant les nouvelles informations.
     * @return Le DTO de l'utilisateur mis à jour.
     * @throws UserNotFoundException       Si aucun utilisateur n'est trouvé avec
     *                                     cet ID.
     * @throws EmailAlreadyExistsException Si le nouvel email est déjà attribué à un
     *                                     autre utilisateur.
     */
    @Transactional
    public UserResponse updateUser(UUID id, UserRequest userRequest) {
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (!userToUpdate.getEmail().equals(userRequest.email()) && userRepository.existsByEmail(userRequest.email())) {
            throw new EmailAlreadyExistsException("Cet email est déjà pris par un autre utilisateur.");
        }
        userToUpdate.setEmail(userRequest.email());
        userToUpdate.setFirstName(userRequest.firstName());
        userToUpdate.setLastName(userRequest.lastName());
        userToUpdate.setPassword(passwordEncoder.encode(userRequest.password()));
        if (userRequest.role() != null) {
            userToUpdate.setRole(userRequest.role());
        }

        User updatedUser = userRepository.save(userToUpdate);
        return userMapper.toResponse(updatedUser);
    }

    /**
     * Supprime un utilisateur de la base de données.
     *
     * @param id L'identifiant unique de l'utilisateur à supprimer.
     * @throws UserNotFoundException Si l'utilisateur n'existe pas, empêchant la
     *                               suppression.
     */
    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Supprime tous les utilisateurs de la base de données.
     */
    @Transactional
    public void deleteUsers() {
        userRepository.deleteAll();
    }

    /**
     * Récupère le profil de l'utilisateur actuellement connecté via son email.
     *
     * @param email L'email de l'utilisateur.
     * @return Le DTO de l'utilisateur.
     * @throws UserNotFoundException si l'utilisateur n'existe pas.
     */
    public UserResponse getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur pas trouvé avec l'email: " + email));
    }

    /**
     * Met à jour le profil de l'utilisateur actuellement connecté.
     *
     * @param email              L'email actuel de l'utilisateur (issu du JWT).
     * @param userProfileRequest Les nouvelles informations de profil.
     * @return Le DTO de l'utilisateur mis à jour.
     */
    @Transactional
    public UserResponse updateCurrentUser(String email, UserProfileRequest userProfileRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'email: " + email));
        if (!user.getEmail().equals(userProfileRequest.email())
                && userRepository.existsByEmail(userProfileRequest.email())) {
            throw new EmailAlreadyExistsException("Cet email est déjà pris par un autre utilisateur.");
        }
        user.setEmail(userProfileRequest.email());
        user.setFirstName(userProfileRequest.firstName());
        user.setLastName(userProfileRequest.lastName());
        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    /**
     * Anonymise les données du compte utilisateur (RGPD) et invalide l'accès.
     * 
     * @param email Email de l'utilisateur à traiter.
     */
    @Transactional
    public void deleteCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'email: " + email));
        user.setFirstName("Utilisateur");
        user.setLastName("Anonymisé");
        user.setEmail("deleted_" + UUID.randomUUID() + "@fika-anonym.fr");
        user.setPassword("{noop}DELETED_" + UUID.randomUUID());

        userRepository.save(user);
    }

    /**
     * Assigne le rôle ADMIN à un utilisateur via son ID.
     * 
     * @param id UUID de l'utilisateur à promouvoir.
     */
    @Transactional
    public void setAdminRole(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        if (user.getRole() != Role.ADMIN) {
            user.setRole(Role.ADMIN);
        }
        userRepository.save(user);
    }
}