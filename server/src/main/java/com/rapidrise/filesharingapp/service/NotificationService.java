package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.NotificationResponse;
import com.rapidrise.filesharingapp.dto.response.UnreadNotificationCountResponse;
import com.rapidrise.filesharingapp.entity.Notification;
import com.rapidrise.filesharingapp.entity.ShareLink;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.enums.ShareType;
import com.rapidrise.filesharingapp.exception.UnauthorizedAccessException;
import com.rapidrise.filesharingapp.repository.NotificationRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private static final String TYPE_FILE_SHARED = "FILE_SHARED";

    private final NotificationRepository notificationRepository;

    public void notifyFileShared(
            User recipient,
            User sender,
            UserFile file,
            ShareLink shareLink
    ) {
        try {
            String senderName =
                    sender.getFirstName()
                            + " "
                            + sender.getLastName();

            String accessLabel =
                    shareLink.getShareType() == ShareType.RESTRICTED
                            ? "restricted"
                            : "public";

            Notification notification =
                    Notification.builder()
                            .recipient(recipient)
                            .type(TYPE_FILE_SHARED)
                            .title("New file shared with you")
                            .message(
                                    senderName
                                            + " shared \""
                                            + file.getName()
                                            + "\" with you ("
                                            + accessLabel
                                            + " link)."
                            )
                            .shareLinkId(shareLink.getId())
                            .fileName(file.getName())
                            .sharedByName(senderName.trim())
                            .read(false)
                            .build();

            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error(
                    "Failed to create share notification for user {}",
                    recipient.getId(),
                    e
            );
        }
    }

    public ResponseEntity<ResponseStructure<List<NotificationResponse>>>
    getMyNotifications(int limit) {

        User user = SecurityUtil.getCurrentUser();

        List<NotificationResponse> notifications =
                notificationRepository
                        .findByRecipientIdOrderByCreatedAtDesc(
                                user.getId(),
                                PageRequest.of(0, limit)
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Notifications fetched successfully",
                notifications
        );
    }

    public ResponseEntity<ResponseStructure<UnreadNotificationCountResponse>>
    getUnreadCount() {

        User user = SecurityUtil.getCurrentUser();

        long count =
                notificationRepository.countByRecipientIdAndReadFalse(
                        user.getId()
                );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Unread count fetched successfully",
                UnreadNotificationCountResponse.builder()
                        .unreadCount(count)
                        .build()
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>>
    markAsRead(Long notificationId) {

        User user = SecurityUtil.getCurrentUser();

        Notification notification =
                notificationRepository
                        .findByIdAndRecipientId(
                                notificationId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new UnauthorizedAccessException(
                                        "Notification not found"
                                ));

        notification.setRead(true);
        notificationRepository.save(notification);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Notification marked as read",
                null
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>>
    markAllAsRead() {

        User user = SecurityUtil.getCurrentUser();

        notificationRepository.markAllReadForRecipient(user.getId());

        return ResponseBuilder.build(
                HttpStatus.OK,
                "All notifications marked as read",
                null
        );
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .shareLinkId(notification.getShareLinkId())
                .fileName(notification.getFileName())
                .sharedByName(notification.getSharedByName())
                .read(Boolean.TRUE.equals(notification.getRead()))
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
