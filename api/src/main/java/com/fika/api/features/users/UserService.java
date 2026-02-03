package com.fika.api.features.users;

import com.fika.api.features.users.dto.UserRequest;
import com.fika.api.features.users.dto.UserResponse;
import com.fika.api.core.exceptions.user.EmailAlreadyExistsException;
import com.fika.api.core.exceptions.user.UserNotFoundException;
import com.fika.api.features.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
     * Récupère la liste de tous les utilisateurs enregistrés.
     *
     * @return Une liste de UserResponse.
     */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    /**
     * Récupère un utilisateur par son identifiant unique.
     *
     * @param id L'UUID de l'utilisateur.
     * @return Le DTO de l'utilisateur trouvé.
     * @throws UserNotFoundException si aucun utilisateur n'existe avec cet ID.
     */
    public UserResponse getUserById(UUID id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException(id));
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
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Supprime tous les utilisateurs de la base de données.
     */
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
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'email: " + email));
    }
}