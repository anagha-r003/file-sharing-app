package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.ForgotPasswordRequest;
import com.rapidrise.filesharingapp.dto.request.ResetPasswordRequest;
import com.rapidrise.filesharingapp.entity.PasswordResetToken;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.exception.InvalidTokenException;
import com.rapidrise.filesharingapp.exception.PasswordMismatchException;
import com.rapidrise.filesharingapp.exception.TooManyRequestsException;
import com.rapidrise.filesharingapp.exception.UserNotFoundException;
import com.rapidrise.filesharingapp.repository.PasswordResetTokenRepository;
import com.rapidrise.filesharingapp.repository.UserRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreatePasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;


    @Transactional
    public ResponseEntity<ResponseStructure<String>> forgotPassword(
            ForgotPasswordRequest request
    ) {
        String email = request.getEmail();

        log.info("Forgot password request for email: {}", email);

        // Check user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        // Rate limiting — max 3 requests per hour
        int recentRequests = passwordResetTokenRepository
                .countByEmailAndCreatedAtAfter(
                        email,
                        LocalDateTime.now().minusHours(1)
                );

        if (recentRequests >= 3) {
            log.warn("Rate limit exceeded for email: {}", email);
            throw new TooManyRequestsException(
                    "Too many requests. Try again after 1 hour"
            );
        }

        // Delete all old tokens for this email
        passwordResetTokenRepository.deleteAllByEmail(email);

        // Generate raw token (sent in email)
        String rawToken = UUID.randomUUID().toString();

        // Hash token before saving to DB
        String hashedToken = DigestUtils.sha256Hex(rawToken);

        // Save hashed token to DB
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(hashedToken)
                .email(email)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send raw token in email
        String resetLink =
                "http://localhost:5173/reset-password?token=" + rawToken;

        emailService.sendPasswordResetEmail(email, resetLink);

        log.info("Reset link sent to email: {}", email);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Password reset link sent to email",
                null
        );
    }

    // ─── RESET PASSWORD ────────────────────────────────────────


    @Transactional
    public ResponseEntity<ResponseStructure<String>> resetPassword(
            ResetPasswordRequest request
    ) {
        log.info("Reset password request received");

        // Passwords match check
        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException(
                    "Passwords do not match"
            );
        }

        // Hash the incoming raw token
        String hashedToken = DigestUtils.sha256Hex(
                request.getToken()
        );

        // Find token in DB
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(hashedToken)
                .orElseThrow(() ->
                        new InvalidTokenException("Invalid token"));

        // Check if already used
        if (resetToken.getUsed()) {
            throw new InvalidTokenException(
                    "Token already used"
            );
        }

        // Check expiry
        if (resetToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Token expired");
        }

        // Find user
        User user = userRepository
                .findByEmail(resetToken.getEmail())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        // Update password
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successful for email: {}",
                resetToken.getEmail());

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Password reset successful",
                null
        );
    }

   
}
