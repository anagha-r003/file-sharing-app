package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.RefreshToken;
import com.rapidrise.filesharingapp.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {

    Optional<RefreshToken> findByToken(String token);
    void deleteByToken(String token);

    @Transactional
    @Modifying
    void deleteAllByExpiryDateBefore(LocalDateTime date);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RefreshToken r WHERE r.token = :token")
    Optional<RefreshToken> findByTokenWithLock(@Param("token") String token);

    // RefreshTokenRepository.java
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.email = :email AND r.deviceId = :deviceId AND r.revoked = false")
    void revokeAllByEmailAndDeviceId(@Param("email") String email, @Param("deviceId") String deviceId);

    void deleteAllByEmail(String email);
}
