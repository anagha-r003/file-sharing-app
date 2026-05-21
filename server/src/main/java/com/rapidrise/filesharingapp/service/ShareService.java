package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.request.CreateShareLinkRequest;
import com.rapidrise.filesharingapp.dto.response.ShareLinkResponse;
import com.rapidrise.filesharingapp.entity.ShareLink;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.exception.BadRequestException;
import com.rapidrise.filesharingapp.exception.FileNotFoundException;
import com.rapidrise.filesharingapp.exception.UnauthorizedAccessException;
import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.repository.ShareLinkRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShareService {

    private final ShareLinkRepository shareLinkRepository;
    private final FileRepository fileRepository;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;


    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public ResponseEntity<
            ResponseStructure<
                    List<ShareLinkResponse>>>
    generateShareLink(
            CreateShareLinkRequest request
    ) {

        log.info(
                "Share link creation request received for fileId: {}",
                request.getFileId()
        );

        if (request.getExpiresAt() == null ||
                request.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )) {

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

        List<ShareLink> shareLinks =
                new ArrayList<>();

        List<ShareLinkResponse>
                responseList =
                new ArrayList<>();

        for (String recipientEmail :
                request.getRecipientEmails()) {

            boolean alreadyShared =
                    shareLinkRepository
                            .existsByFileIdAndRecipientEmailAndActiveTrue(
                                    file.getId(),
                                    recipientEmail
                            );

            ShareLink existingShareLink =
                    shareLinkRepository
                            .findTopByFileIdAndRecipientEmailAndActiveTrueOrderByCreatedAtDesc(
                                    file.getId(),
                                    recipientEmail
                            )
                            .orElse(null);

          // deactivate previous active link
            if (existingShareLink != null) {

                existingShareLink.setActive(false);

                shareLinkRepository
                        .save(existingShareLink);
            }

            String token =
                    UUID.randomUUID()
                            .toString();

            String shareUrl =
                    frontendUrl
                            + "/public/share/"
                            + token;

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
                                    request
                                            .getExpiresAt()
                            )

                            .active(true)
                            .downloadCount(0)
                            .file(file)
                            .createdBy(user)
                            .build();

            shareLinks.add(shareLink);

            responseList.add(
                    ShareLinkResponse
                            .builder()
                            .shareUrl(
                                    shareUrl
                            )
                            .recipientEmail(
                                    recipientEmail
                            )
                            .fileName(
                                    file.getName()
                            )
                            .expiresAt(
                                    request
                                            .getExpiresAt()
                            )
                            .build()
            );
        }

        shareLinkRepository
                .saveAll(shareLinks);

        for (int i = 0;
             i < shareLinks.size();
             i++) {

            activityLogService.log(
                    user,
                    "SHARE",
                    file.getName(),
                    "with "
                            + shareLinks.get(i)
                            .getRecipientEmail()
            );
        }

        if (responseList.isEmpty()) {

            return ResponseBuilder.build(
                    HttpStatus.OK,
                    "All recipients already have active share links",
                    responseList
            );
        }

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Share link generated successfully",
                responseList
        );
    }

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

        User user =
                SecurityUtil.getCurrentUser();

        UserFile file =
                getAuthorizedFile(
                        request.getFileId(),
                        user.getId()
                );

        for (String recipientEmail :
                request.getRecipientEmails()) {

            ShareLink shareLink =
                    shareLinkRepository
                            .findTopByFileIdAndRecipientEmailOrderByCreatedAtDesc(
                                    file.getId(),
                                    recipientEmail
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Share link not found"
                                    ));

            String shareUrl =
                    frontendUrl
                            + "/public/share/"
                            + shareLink.getToken();

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

        shareLinkRepository.save(shareLink);

        User owner = shareLink.getCreatedBy();
        activityLogService.log(owner, "ACCESS", shareLink.getFile().getName(),
                shareLink.getRecipientEmail() + " accessed");

        ShareLinkResponse response =
                ShareLinkResponse.builder()

                        .recipientEmail(
                                shareLink.getRecipientEmail()
                        )

                        .fileName(
                                shareLink.getFile().getName()
                        )

                        .expiresAt(
                                shareLink.getExpiresAt()
                        )

                        .accessed(true)

                        .viewUrl(baseUrl + "/share/view/" + shareLink.getToken())

                        .downloadUrl(baseUrl + "/share/download/" + shareLink.getToken())
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

                        .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Share link accessed successfully",
                response
        );
    }

    @Transactional
    public ResponseEntity<Resource>
    downloadSharedFile(String token)
            throws IOException {

        log.info(
                "Downloading shared file with token: {}",
                token
        );

        ShareLink shareLink =
                getValidShareLink(token);

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

        LocalDateTime now = LocalDateTime.now();

        // Check and update expired links
        sharedFiles.forEach(shareLink -> {

            if (Boolean.TRUE.equals(shareLink.getActive())
                    && shareLink.getExpiresAt() != null
                    && shareLink.getExpiresAt().isBefore(now)) {

                shareLink.setActive(false);

                shareLinkRepository.save(shareLink);
            }
        });

        Page<ShareLinkResponse> response =
                sharedFiles.map(shareLink ->
                        ShareLinkResponse.builder()
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
                                .build()
                );

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
                                new RuntimeException(
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
    viewSharedFile(String token)
            throws IOException {

        log.info("Viewing shared file with token: {}", token);

        ShareLink shareLink =
                getValidShareLink(token);

        shareLinkRepository.save(shareLink);

        UserFile file = shareLink.getFile();

        Path path = Paths.get(file.getPath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists()) {

            throw new RuntimeException(
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



    private ShareLink getValidShareLink(
            String token
    ) {

        ShareLink shareLink =
                shareLinkRepository.findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid share link"
                                ));

        if (!shareLink.getActive()) {

            throw new RuntimeException(
                    "Share link is inactive"
            );
        }

        if (shareLink.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Share link expired"
            );
        }

        return shareLink;
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
