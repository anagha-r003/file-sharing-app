package com.rapidrise.filesharingapp.scheduler;

import com.rapidrise.filesharingapp.repository.PasswordResetTokenRepository;
import com.rapidrise.filesharingapp.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Scheduled(cron = "0 0 * * * *") // runs every hour
    //@Scheduled(cron = "0 * * * * *")
    public void deleteExpiredTokens() {

        log.info("Starting scheduled token cleanup...");
        refreshTokenRepository
                .deleteAllByExpiryDateBefore(LocalDateTime.now());

        // Clean password reset tokens
        passwordResetTokenRepository
                .deleteAllByExpiryDateBefore(LocalDateTime.now());

        log.info("Token cleanup job completed.");
    }
}
