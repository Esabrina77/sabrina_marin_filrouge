package com.fika.api.service;

import com.fika.api.model.User;
import com.fika.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(UUID id) {
        return userRepository.getReferenceById(id);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }
}
