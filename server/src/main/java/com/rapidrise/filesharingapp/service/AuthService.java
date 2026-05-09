package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.LoginRequest;
import com.rapidrise.filesharingapp.dto.response.LoginResponse;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.exception.EmailAlreadyExistsException;
import com.rapidrise.filesharingapp.exception.InvalidCredentialsException;
import com.rapidrise.filesharingapp.exception.PasswordMismatchException;
import com.rapidrise.filesharingapp.exception.UserNotFoundException;
import com.rapidrise.filesharingapp.jwt.JwtService;
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
    private final JwtService jwtService;
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

    public ResponseEntity<ResponseStructure<LoginResponse>> login(
            LoginRequest request
    ) {
        log.info("Login request received for email: {}", request.getEmail());

        // Check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found: {}", request.getEmail());
                    return new UserNotFoundException("User not Registered");
                });

        // Password check
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed - invalid password for email: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        log.info("Login successful for email: {}", request.getEmail());

        // Response payload
        LoginResponse response = LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Login Successful",
                response
        );
    }

}
