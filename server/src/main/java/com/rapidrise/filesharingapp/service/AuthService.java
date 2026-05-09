package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.exception.EmailAlreadyExistsException;
import com.rapidrise.filesharingapp.exception.PasswordMismatchException;
import com.rapidrise.filesharingapp.repository.UserRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.rapidrise.filesharingapp.dto.request.RegisterRequest;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ResponseEntity<ResponseStructure<String>> register(
            RegisterRequest request
    ) {

        log.info("Registration request received for email: {}", request.getEmail());

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("Password mismatch for email: {}", request.getEmail());
            throw new PasswordMismatchException("Passwords do not match");
        }

        userRepository.findByEmail(request.getEmail())
                .ifPresent(existingUser -> {
                    log.warn("Duplicate registration attempt for email: {}", request.getEmail());
                    throw new EmailAlreadyExistsException("Email already registered");
                });

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                . storageLimit(1024L * 1024 * 1024)
                .dob(request.getDob())
                .build();

        userRepository.save(user);

        log.info("User registered successfully: {}", request.getEmail());

        return ResponseBuilder.build(
                HttpStatus.CREATED,
                "Registration Successful",
                null
        );
    }

}
