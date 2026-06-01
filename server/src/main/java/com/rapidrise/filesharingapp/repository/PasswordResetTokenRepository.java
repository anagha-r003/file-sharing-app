package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken,Long> {

    Optional<PasswordResetToken> findByToken(String token);

    // for rate limiting — count requests in last hour
    int countByEmailAndCreatedAtAfter(
            String email,
            LocalDateTime time
    );

    // delete all old tokens for same email
    void deleteAllByEmail(String email);

    // for scheduler cleanup
    void deleteAllByExpiryDateBefore(LocalDateTime time);
}
