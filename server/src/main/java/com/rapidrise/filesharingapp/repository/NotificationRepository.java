package com.rapidrise.filesharingapp.repository;

import com.rapidrise.filesharingapp.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(
            Long recipientId,
            Pageable pageable
    );

    long countByRecipientIdAndReadFalse(Long recipientId);

    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.read = true
            WHERE n.recipient.id = :recipientId
            AND n.read = false
            """)
    int markAllReadForRecipient(@Param("recipientId") Long recipientId);
}
