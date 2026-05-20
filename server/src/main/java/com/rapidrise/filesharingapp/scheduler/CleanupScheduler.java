package com.rapidrise.filesharingapp.scheduler;

import com.rapidrise.filesharingapp.repository.PasswordResetTokenRepository;
import com.rapidrise.filesharingapp.repository.RefreshTokenRepository;
import com.rapidrise.filesharingapp.service.FileCleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final FileCleanupService fileCleanupService;

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

    @Scheduled(cron = "0 0 2 * * *") // runs every day at 2 AM
    //@Scheduled(cron = "0 * * * * *")
    public void deleteExpiredFiles() {
        log.info("Starting scheduled file cleanup...");
        fileCleanupService.deleteExpiredFiles();
        log.info("File cleanup job completed.");
    }
}
