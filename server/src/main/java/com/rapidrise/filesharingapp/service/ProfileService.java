package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.ChangePasswordRequest;
import com.rapidrise.filesharingapp.dto.request.UpdateProfileRequest;
import com.rapidrise.filesharingapp.dto.response.ProfileResponse;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.exception.PasswordMismatchException;
import com.rapidrise.filesharingapp.exception.UserNotFoundException;
import com.rapidrise.filesharingapp.repository.RefreshTokenRepository;
import com.rapidrise.filesharingapp.repository.UserRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    public ResponseEntity<ResponseStructure<ProfileResponse>> getProfile() {

        String email = getLoggedInUserEmail();

        log.info("Fetching profile for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn(
                            "User not found for email: {}",
                            email
                    );
                    return new UserNotFoundException(
                            "User not found"
                    );
                });

        ProfileResponse response =
                ProfileResponse.builder()
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .build();

        log.info(
                "Profile fetched successfully for email: {}",
                email
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Profile fetched successfully",
                response
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<ProfileResponse>>
    updateProfile(
            UpdateProfileRequest request
    ) {

        String email = getLoggedInUserEmail();

        log.info(
                "Profile update request for email: {}",
                email
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn(
                            "User not found for email: {}",
                            email
                    );
                    return new UserNotFoundException(
                            "User not found"
                    );
                });

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        userRepository.save(user);

        ProfileResponse response =
                ProfileResponse.builder()
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .build();

        log.info(
                "Profile updated successfully for email: {}",
                email
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Profile updated successfully",
                response
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>>
    changePassword(
            ChangePasswordRequest request,
            Authentication authentication
    ) {

        log.info("Change password request received");

        // Get logged in user's email
        String email = getLoggedInUserEmail();


        // Find user
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"
                        ));

        // Check current password
        boolean isCurrentPasswordCorrect =
                passwordEncoder.matches(
                        request.getCurrentPassword(),
                        user.getPassword()
                );

        if (!isCurrentPasswordCorrect) {
            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        // Check new password and confirm password match
        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new PasswordMismatchException(
                    "Passwords do not match"
            );
        }

        // Prevent same password reuse
        boolean isSamePassword =
                passwordEncoder.matches(
                        request.getNewPassword(),
                        user.getPassword()
                );

        if (isSamePassword) {
            throw new IllegalArgumentException(
                    "New password cannot be same as current password"
            );
        }

        // Encode and update password
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        // Invalidate all refresh tokens
        refreshTokenRepository
                .deleteAllByEmail(
                        email
                );

        log.info(
                "Password changed successfully for user: {}",
                email
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Password changed successfully. Please login again.",
                null
        );
    }

    private String getLoggedInUserEmail() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        User user =
                (User) authentication.getPrincipal();

        return user.getEmail();
    }

}
