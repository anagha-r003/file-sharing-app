package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.RestrictedShareOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
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

    @Modifying
    @Query("""
    DELETE FROM RestrictedShareOtp o
    WHERE o.shareLink.id IN :shareLinkIds
    """)
    void deleteAllByShareLinkIdIn(
            @Param("shareLinkIds") List<Long> shareLinkIds
    );

    @Modifying
    @Query("""
    DELETE FROM RestrictedShareOtp o
    WHERE o.shareLink.file.id IN :fileIds
    """)
    void deleteAllByShareLinkFileIdIn(
            @Param("fileIds") List<Long> fileIds
    );
}
