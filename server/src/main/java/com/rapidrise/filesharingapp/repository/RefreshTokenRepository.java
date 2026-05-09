package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {

    Optional<RefreshToken> findByToken(String token);
    void deleteByToken(String token);

    @Transactional
    @Modifying
    void deleteAllByExpiryDateBefore(LocalDateTime date);
}
