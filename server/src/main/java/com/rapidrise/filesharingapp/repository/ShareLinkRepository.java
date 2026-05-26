package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.ShareLink;
import com.rapidrise.filesharingapp.entity.UserFile;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShareLinkRepository extends JpaRepository<ShareLink,Long> {

    Optional<ShareLink> findByToken(String token);

    List<ShareLink> findByFile(UserFile file);

    Page<ShareLink> findByCreatedByIdOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );

    long countByCreatedById(Long userId);

    long countByCreatedByIdAndActiveTrueAndExpiresAtAfter(
            Long userId,
            LocalDateTime now
    );

    boolean existsByFileIdAndRecipientEmailAndActiveTrue(Long fileId, String recipientEmail);

    @Modifying
    @Query("DELETE FROM ShareLink s WHERE s.file.id IN :fileIds")
    void deleteAllByFileIdIn(@Param("fileIds") List<Long> fileIds);

    Optional<ShareLink>
    findTopByFileIdAndRecipientEmailOrderByCreatedAtDesc(
            Long fileId,
            String recipientEmail
    );

    Optional<ShareLink>
    findTopByFileIdAndRecipientEmailAndActiveTrueOrderByCreatedAtDesc(
            Long fileId,
            String recipientEmail
    );

    @Query("""
            SELECT s FROM ShareLink s
            WHERE s.recipientEmail = :recipientEmail
            AND s.active = true
            AND (s.hiddenByRecipient IS NULL OR s.hiddenByRecipient = false)
            AND s.expiresAt > :now
            ORDER BY s.createdAt DESC
            """)
    Page<ShareLink> findVisibleSharedWithMe(
            @Param("recipientEmail") String recipientEmail,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );
}
