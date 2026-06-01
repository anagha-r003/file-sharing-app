package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.CreateShareLinkRequest;
import com.rapidrise.filesharingapp.dto.response.ShareLinkResponse;
import com.rapidrise.filesharingapp.entity.ShareLink;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.enums.ShareType;
import com.rapidrise.filesharingapp.exception.BadRequestException;
import com.rapidrise.filesharingapp.exception.FileNotFoundException;
import com.rapidrise.filesharingapp.exception.ShareLinkNotFoundException;
import com.rapidrise.filesharingapp.exception.UnauthorizedAccessException;
import com.rapidrise.filesharingapp.jwt.JwtService;
import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.repository.ShareLinkRepository;
import com.rapidrise.filesharingapp.repository.UserRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.nio.file.Files;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShareService {

    private final ShareLinkRepository shareLinkRepository;
    private final FileRepository fileRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final JwtService jwtService;
    private final UserRepository userRepository;


    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public ResponseEntity<
            ResponseStructure<String>>
    sendShareEmail(
            CreateShareLinkRequest request
    ) {

        log.info(
                "Sending share email for fileId: {}",
                request.getFileId()
        );

        // Validate expiry
        if (request.getExpiresAt() == null
                || request.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new BadRequestException(
                    "Expiry date must be a future date"
            );
        }

        User user =
                SecurityUtil.getCurrentUser();

        UserFile file =
                getAuthorizedFile(
                        request.getFileId(),
                        user.getId()
                );

        // Validate duplicate recipient emails
        Set<String> uniqueEmails =
                new HashSet<>();

        for (String email :
                request.getRecipientEmails()) {

            String normalizedEmail =
                    email.trim()
                            .toLowerCase();

            if (!uniqueEmails.add(
                    normalizedEmail
            )) {

                throw new BadRequestException(
                        "Duplicate recipient emails are not allowed: "
                                + email
                );
            }
        }

        for (String recipientEmail :
                request.getRecipientEmails()) {

            if (
                    recipientEmail.equalsIgnoreCase(
                            user.getEmail()
                    )
            ) {

                throw new BadRequestException(
                        "You cannot share files with yourself"
                );
            }

            boolean recipientHasAccount =
                    userRepository
                            .findByEmail(
                                    recipientEmail
                            )
                            .isPresent();

            // Generate token
            String token =
                    UUID.randomUUID()
                            .toString();

            // Create share link
            ShareLink shareLink =
                    ShareLink.builder()
                            .token(token)
                            .recipientEmail(
                                    recipientEmail
                            )
                            .message(
                                    request.getMessage()
                            )
                            .expiresAt(
                                    request.getExpiresAt()
                            )
                            .active(true)
                            .downloadCount(0)
                            .shareType(
                                    request.getShareType()
                            )
                            .requiresOtp(
                                    request.getShareType()
                                            == ShareType.RESTRICTED
                                            && !recipientHasAccount
                            )
                            .file(file)
                            .createdBy(user)
                            .build();

            shareLinkRepository.save(
                    shareLink
            );

            String shareUrl =
                    frontendUrl
                            + "/public/share/"
                            + shareLink.getToken();

            // Activity log
            activityLogService.log(
                    user,
                    "SHARE",
                    file.getName(),
                    "with "
                            + recipientEmail
            );

            // In-app notification
            userRepository
                    .findByEmail(
                            recipientEmail
                    )
                    .ifPresent(recipient ->
                            notificationService
                                    .notifyFileShared(
                                            recipient,
                                            user,
                                            file,
                                            shareLink
                                    )
                    );

            // Send email
            try {

                emailService
                        .sendShareLinkEmail(
                                recipientEmail,
                                user.getFirstName(),
                                shareUrl,
                                request.getMessage()
                        );

            } catch (Exception e) {

                log.error(
                        "Failed to send email to {}: {}",
                        recipientEmail,
                        e.getMessage()
                );
            }
        }

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Email sent successfully",
                null
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<ShareLinkResponse>>
    resolveShareLink(String token) {

        log.info("Resolving share link: {}", token);

        ShareLink shareLink =
                getValidShareLink(token);

        // Check physical file existence
        Path filePath =
                Paths.get(
                        shareLink
                                .getFile()
                                .getPath()
                ).normalize();

        log.info(
                "Checking shared file path: {}",
                filePath.toAbsolutePath()
        );

        if (!Files.exists(filePath)) {

            log.error(
                    "Shared file missing: {}",
                    filePath.toAbsolutePath()
            );

            throw new FileNotFoundException(
                    "Shared file no longer exists"
            );
        }

        shareLink.setAccessed(true);
        shareLinkRepository.save(shareLink);

        User owner = shareLink.getCreatedBy();
        activityLogService.log(owner, "ACCESS", shareLink.getFile().getName(),
                shareLink.getRecipientEmail() + " accessed");

        ShareLinkResponse.ShareLinkResponseBuilder
                builder =
                ShareLinkResponse.builder()

                        .recipientEmail(
                                shareLink
                                        .getRecipientEmail()
                        )

                        .fileName(
                                shareLink
                                        .getFile()
                                        .getName()
                        )

                        .expiresAt(
                                shareLink
                                        .getExpiresAt()
                        )

                        .accessed(true)

                        .sharedByName(
                                shareLink
                                        .getCreatedBy()
                                        .getFirstName()
                                        + " "
                                        + shareLink
                                        .getCreatedBy()
                                        .getLastName()
                        )

                        .sharedByEmail(
                                shareLink
                                        .getCreatedBy()
                                        .getEmail()
                        )

                        // NEW
                        .requiresOtp(
                                shareLink
                                        .getRequiresOtp()
                        )
                        .shareType(
                                shareLink
                                        .getShareType() != null ? shareLink.getShareType().name() : null
                        );


// PUBLIC share → return URLs immediately
        if (shareLink.getShareType()
                == ShareType.PUBLIC) {

            builder.viewUrl(
                    baseUrl
                            + "/share/view/"
                            + shareLink.getToken()
            );

            builder.downloadUrl(
                    baseUrl
                            + "/share/download/"
                            + shareLink.getToken()
            );
        }

        ShareLinkResponse response =
                builder.build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Share link accessed successfully",
                response
        );
    }

    @Transactional
    public ResponseEntity<Resource>
    downloadSharedFile(String token, String authHeader)
            throws IOException {

        log.info(
                "Downloading shared file with token: {}",
                token
        );

        ShareLink shareLink =
                getValidShareLink(token);

        validateRestrictedAccess(
                shareLink,
                authHeader
        );

        shareLink.setDownloadCount(shareLink.getDownloadCount() + 1);

        shareLinkRepository.save(shareLink);

        UserFile file = shareLink.getFile();

        Path path = Paths.get(file.getPath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists()) {

            throw new FileNotFoundException(
                    "File not found"
            );
        }

        String contentType =
                file.getMimeType() != null
                        ? file.getMimeType()
                        : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + file.getName() + "\""
                )
                .body(resource);
    }

    public ResponseEntity<ResponseStructure<Page<ShareLinkResponse>>>
    getMySharedFiles(int page, int size) {

        log.info("Fetching shared files");

        User user = SecurityUtil.getCurrentUser();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        Page<ShareLink> sharedFiles = shareLinkRepository
                .findByCreatedByIdOrderByCreatedAtDesc(
                        user.getId(),
                        pageable
                );

        Set<String> accessedShareKeys = activityLogService.getAccessedShareKeys(
                user.getId(),
                sharedFiles.getContent()
        );

        Page<ShareLinkResponse> response =
                sharedFiles.map(shareLink -> {

                    String status= getShareStatus(shareLink);
                    String fileName = shareLink.getFile().getName();
                    String recipientEmail = shareLink.getRecipientEmail();
                    boolean accessed = Boolean.TRUE.equals(shareLink.getAccessed())
                            || accessedShareKeys.contains(
                                    ActivityLogService.shareAccessKey(fileName, recipientEmail)
                            );

                    return ShareLinkResponse.builder()
                            .id(shareLink.getId())
                            .shareUrl(
                                    frontendUrl
                                            + "/public/share/"
                                            + shareLink.getToken()
                            )
                            .recipientEmail(
                                    shareLink.getRecipientEmail()
                            )
                            .fileName(
                                    shareLink.getFile().getName()
                            )
                            .active(
                                    shareLink.getActive()
                            )
                            .expiresAt(
                                    shareLink.getExpiresAt()
                            )
                            .downloadCount(
                                    shareLink.getDownloadCount()
                            )
                            .requiresOtp(
                                    shareLink.getRequiresOtp()
                            )
                            .shareType(
                                    shareLink.getShareType() != null
                                            ? shareLink.getShareType().name()
                                            : null
                            )
                            .fileId(
                                    shareLink.getFile().getId()
                            )
                            .status(status)
                            .accessed(accessed)
                            .build();
                });

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Shared files fetched successfully",
                response
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>>
    revokeShareLink(Long shareId) {

        log.info("Revoking share link: {}", shareId);

        User user = SecurityUtil.getCurrentUser();

        ShareLink shareLink =
                shareLinkRepository.findById(shareId)
                        .orElseThrow(() ->
                                new ShareLinkNotFoundException(
                                        "Share link not found"
                                ));

        if (!shareLink.getCreatedBy()
                .getId()
                .equals(user.getId())) {

            throw new UnauthorizedAccessException(
                    "Unauthorized access"
            );
        }

        shareLink.setActive(false);

        shareLinkRepository.save(shareLink);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Share link revoked successfully",
                null
        );
    }

    public ResponseEntity<Resource>
    viewSharedFile(String token,String authHeader)
            throws IOException {

        log.info("Viewing shared file with token: {}", token);

        ShareLink shareLink =
                getValidShareLink(token);

        validateRestrictedAccess(
                shareLink,
                authHeader
        );

        shareLinkRepository.save(shareLink);

        UserFile file = shareLink.getFile();
        log.info("File path: {}", file.getPath()); // ← add this

        Path path = Paths.get(file.getPath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists()) {

            throw new FileNotFoundException(
                    "File not found"
            );
        }

        String contentType =
                file.getMimeType() != null
                        ? file.getMimeType()
                        : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                file.getName() + "\""
                )
                .body(resource);
    }

    private void validateRestrictedAccess(
            ShareLink shareLink,
            String authHeader
    ) {

        log.info(
                "Auth Header: {}",
                authHeader
        );

        if (shareLink.getShareType()
                == ShareType.PUBLIC) {

            return;
        }

        if (authHeader == null
                || !authHeader.startsWith(
                "Bearer "
        )) {

            throw new UnauthorizedAccessException(
                    "Access token required"
            );
        }

        String accessToken =
                authHeader.substring(7);

        log.info(
                "Access token: {}",
                accessToken
        );

        log.info(
                "IS SHARE TOKEN = {}",
                jwtService.isShareAccessToken(
                        accessToken
                )
        );

        if (!jwtService
                .isShareAccessToken(
                        accessToken
                )) {

            // Check if it is a valid regular user access token
            if (jwtService.isTokenValid(accessToken)) {
                String userEmail = jwtService.extractUsername(accessToken);
                log.info(
                        "LOGGED USER EMAIL = {}",
                        userEmail
                );

                log.info(
                        "RECIPIENT EMAIL = {}",
                        shareLink.getRecipientEmail()
                );
                if (userEmail != null && userEmail.equalsIgnoreCase(shareLink.getRecipientEmail())) {
                    log.info("ACCESS GRANTED via recipient user account login session");
                    return;
                }
            }

            throw new UnauthorizedAccessException(
                    "Invalid share access token or user session"
            );
        }

        log.info(
                "Is token valid: {}",
                jwtService.isTokenValid(
                        accessToken
                )
        );

        if (!jwtService.isTokenValid(
                accessToken
        )) {

            throw new UnauthorizedAccessException(
                    "Invalid access token"
            );
        }



        String shareToken =
                jwtService
                        .extractShareToken(
                                accessToken
                        );

        log.info(
                "JWT SHARE TOKEN = {}",
                shareToken
        );

        log.info(
                "URL SHARE TOKEN = {}",
                shareLink.getToken()
        );

        if (!shareToken.equals(
                shareLink.getToken()
        )) {

            throw new UnauthorizedAccessException(
                    "Unauthorized access"
            );
        }

        log.info("ACCESS GRANTED");
    }



    private ShareLink getValidShareLink(
            String token
    ) {

        ShareLink shareLink =
                shareLinkRepository.findByToken(token)
                        .orElseThrow(() ->
                                new ShareLinkNotFoundException(
                                        "Invalid share link"
                                ));

        if (!shareLink.getActive()) {

            throw new BadRequestException(
                    "Share link is inactive"
            );
        }

        if (shareLink.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new BadRequestException(
                    "Share link expired"
            );
        }

        return shareLink;
    }


    public ResponseEntity<ResponseStructure<Page<ShareLinkResponse>>>
    getFilesSharedWithMe(int page, int size) {

        log.info("Fetching files shared with me");

        User user = SecurityUtil.getCurrentUser();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        Page<ShareLink> sharedFiles =
                shareLinkRepository
                        .findAllSharedWithMe(
                                user.getEmail(),
                                pageable
                        );

        Page<ShareLinkResponse> response =
                sharedFiles.map(shareLink -> {

                    String status=getShareStatus(shareLink);

                    return ShareLinkResponse.builder()
                            .id(shareLink.getId())
                            .shareUrl(
                                    frontendUrl
                                            + "/public/share/"
                                            + shareLink.getToken()
                            )
                            .recipientEmail(
                                    shareLink.getRecipientEmail()
                            )
                            .fileName(
                                    shareLink.getFile().getName()
                            )
                            .active(
                                    shareLink.getActive()
                            )
                            .expiresAt(
                                    shareLink.getExpiresAt()
                            )
                            .downloadCount(
                                    shareLink.getDownloadCount()
                            )
                            .sharedByName(
                                    shareLink.getCreatedBy()
                                            .getFirstName()
                                            + " "
                                            + shareLink.getCreatedBy()
                                            .getLastName()
                            )
                            .sharedByEmail(
                                    shareLink.getCreatedBy()
                                            .getEmail()
                            )
                            .requiresOtp(
                                    shareLink.getRequiresOtp()
                            )
                            .shareType(
                                    shareLink.getShareType() != null
                                            ? shareLink.getShareType().name()
                                            : null
                            )
                            .status(status) // THIS WAS MISSING
                            .build();
                });

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files shared with you fetched successfully",
                response
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>>
    dismissFromSharedWithMe(Long shareId) {

        log.info("Dismissing shared file from recipient list: {}", shareId);

        User user = SecurityUtil.getCurrentUser();

        ShareLink shareLink =
                shareLinkRepository.findById(shareId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Share link not found"
                                ));

        if (!shareLink.getRecipientEmail()
                .equalsIgnoreCase(user.getEmail())) {

            throw new UnauthorizedAccessException(
                    "Unauthorized access"
            );
        }

        shareLink.setHiddenByRecipient(true);

        shareLinkRepository.save(shareLink);

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Shared file removed from your list",
                null
        );
    }

    private String getShareStatus(
            ShareLink shareLink
    ) {

        if (!Boolean.TRUE.equals(
                shareLink.getActive()
        )) {

            return "REVOKED";
        }

        if (
                shareLink.getExpiresAt() != null
                        &&
                        shareLink.getExpiresAt()
                                .isBefore(
                                        LocalDateTime.now()
                                )
        ) {

            return "EXPIRED";
        }

        return "ACTIVE";
    }


    private UserFile getAuthorizedFile(
            Long fileId,
            Long userId
    ) {

        UserFile file =
                fileRepository.findById(fileId)
                        .orElseThrow(() ->
                                new FileNotFoundException(
                                        "File not found"
                                ));

        if (!file.getUser()
                .getId()
                .equals(userId)) {

            throw new UnauthorizedAccessException(
                    "Unauthorized access to file"
            );
        }

        return file;
    }

}
