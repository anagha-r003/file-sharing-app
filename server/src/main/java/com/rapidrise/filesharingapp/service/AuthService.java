package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.LoginRequest;
import com.rapidrise.filesharingapp.dto.response.LoginResponse;
import com.rapidrise.filesharingapp.dto.response.RefreshTokenResponse;
import com.rapidrise.filesharingapp.entity.RefreshToken;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.exception.*;
import com.rapidrise.filesharingapp.jwt.JwtService;
import com.rapidrise.filesharingapp.repository.RefreshTokenRepository;
import com.rapidrise.filesharingapp.repository.UserRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.rapidrise.filesharingapp.dto.request.RegisterRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
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
            LoginRequest request,
            HttpServletResponse httpResponse,
            HttpServletRequest httpRequest
    ) {
        log.info("Login request received for email: {}", request.getEmail());

        String deviceId = httpRequest.getHeader("X-Device-Id");

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

        // Save refresh token to DB
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .email(user.getEmail())
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .deviceId(deviceId)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // Send refresh token as HttpOnly cookie
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set true in production
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        httpResponse.addCookie(cookie);

        log.info("Login successful for email: {}", request.getEmail());

        // Response payload — NO refreshToken here
        LoginResponse response = LoginResponse.builder()
                .accessToken(accessToken)
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

    public ResponseEntity<ResponseStructure<RefreshTokenResponse>> refreshToken(HttpServletRequest request ) {

        String refreshToken = extractRefreshToken(request);
        // Find token in DB
        RefreshToken storedToken = refreshTokenRepository
                .findByToken(refreshToken)
                .orElseThrow(() ->
                        new InvalidTokenException("Invalid refresh token"));

        // Grace period — allow 30 seconds after revocation
        if (storedToken.getRevoked() &&
                storedToken.getExpiryDate()
                        .isBefore(LocalDateTime.now().minusSeconds(30))) {
            throw new InvalidTokenException("Refresh token revoked");
        }

        // Check token validity
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new InvalidTokenException("Expired refresh token");
        }

        String email = jwtService.extractUsername(refreshToken);
        String newAccessToken = jwtService.generateAccessToken(email);
        String newRefreshToken = jwtService.generateRefreshToken(email);

        // Revoke old token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Save new token
        RefreshToken newToken = RefreshToken.builder()
                .token(newRefreshToken)
                .email(email)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .deviceId(storedToken.getDeviceId())
                .build();
        refreshTokenRepository.save(newToken);

        log.info("Refresh token rotated for email: {}", email);

        RefreshTokenResponse response=RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Token refershed",
                response
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>> logout(
            HttpServletRequest request,
            HttpServletResponse httpResponse
    ) {

        String refreshToken = extractRefreshToken(request);
        // Delete from DB
        if (refreshToken != null) {
            refreshTokenRepository
                    .findByToken(refreshToken)
                    .ifPresent(token -> {
                        refreshTokenRepository.deleteByToken(refreshToken);
                        log.info("Refresh token deleted for email: {}", token.getEmail());
                    });
        } else {
            throw new InvalidTokenException("No refresh token found");
        }

        // Clear cookie from browser
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set true in production
        cookie.setPath("/");
        cookie.setMaxAge(0); // deletes the cookie
        httpResponse.addCookie(cookie);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Logout Successful",
                null
        );
    }

    private String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refreshToken")) {
                    return cookie.getValue();
                }
            }
        }
        throw new InvalidTokenException("No refresh token found");
    }


}
