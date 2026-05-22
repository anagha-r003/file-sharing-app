package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.RestrictedShareOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RestrictedShareOtpRepository extends JpaRepository<RestrictedShareOtp,Long> {

    Optional<RestrictedShareOtp>
    findTopByShareLinkTokenAndEmailOrderByCreatedAtDesc(
            String token,
            String email
    );

    void deleteAllByShareLinkIdAndEmail(
            Long shareLinkId,
            String email
    );

    int countByEmailAndCreatedAtAfter(
            String email,
            LocalDateTime time
    );

    void deleteByExpiryDateBefore(
            LocalDateTime now
    );

    Optional<RestrictedShareOtp>
    findTopByShareLinkIdAndEmailOrderByCreatedAtDesc(
            Long shareLinkId,
            String email
    );
}
