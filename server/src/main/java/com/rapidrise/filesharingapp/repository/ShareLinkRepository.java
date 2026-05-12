package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.ShareLink;
import com.rapidrise.filesharingapp.entity.UserFile;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;


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

    long countByCreatedByIdAndExpiresAtAfter(
            Long userId,
            LocalDateTime now
    );

    boolean existsByFileIdAndRecipientEmailAndActiveTrue(Long fileId, String recipientEmail);
}
