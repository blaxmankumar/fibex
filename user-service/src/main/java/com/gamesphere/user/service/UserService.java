package com.gamesphere.user.service;

import com.gamesphere.user.dto.*;
import com.gamesphere.user.entity.User;
import com.gamesphere.user.repository.UserRepository;
import com.gamesphere.user.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String defaultAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + request.getUsername();
        String avatar = (request.getAvatarUrl() == null || request.getAvatarUrl().isEmpty()) 
                ? defaultAvatar : request.getAvatarUrl();

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(avatar)
                .bio(request.getBio())
                .build();

        user = userRepository.save(user);
        
        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getId());
        
        return AuthResponse.builder()
                .token(token)
                .user(convertToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .user(convertToUserResponse(user))
                .build();
    }

    public UserResponse getProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserResponse(user);
    }

    public UserResponse updateProfile(Long id, RegisterRequest request, String token) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate token matches user
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Unauthorized");
        }
        String tokenUsername = jwtTokenProvider.getUsernameFromJWT(token);
        if (!user.getUsername().equals(tokenUsername)) {
            throw new RuntimeException("Unauthorized to edit this profile");
        }

        if (request.getUsername() != null && !request.getUsername().isEmpty() && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty() && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        return convertToUserResponse(user);
    }

    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .build();
    }
}
