package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.FileResponse;
import com.rapidrise.filesharingapp.dto.response.RecycleBinStatsResponse;
import com.rapidrise.filesharingapp.entity.ShareHistory;
import com.rapidrise.filesharingapp.entity.ShareLink;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.exception.FileNotFoundException;
import com.rapidrise.filesharingapp.exception.InvalidFileException;
import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.repository.ShareHistoryRepository;
import com.rapidrise.filesharingapp.repository.ShareLinkRepository;
import com.rapidrise.filesharingapp.repository.UserRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecycleBinService {

    private final FileRepository fileRepository;
    private final ShareLinkRepository shareLinkRepository;
    private final UserRepository userRepository;
    private final ShareHistoryRepository shareHistoryRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;


    public ResponseEntity<ResponseStructure<Page<FileResponse>>>
    getDeletedFiles(
            int page,
            int size
    ) {

        log.info("Fetching deleted files");

        User user = SecurityUtil.getCurrentUser();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("deletedAt").descending()
        );

        Page<UserFile> files =
                fileRepository.findByUserIdAndIsDeletedTrue(
                        user.getId(),
                        pageable
                );

        Page<FileResponse> dtoPage =
                files.map(file ->

                        FileResponse.builder()
                                .id(file.getId())
                                .name(file.getName())
                                .size(file.getSize())
                                .mimeType(file.getMimeType())
                                .type(file.getType())
                                .previewPath(file.getPreviewPath())
                                .isStarred(file.getIsStarred())
                                .uploadedAt(file.getUploadedAt())
                                .deletedAt(file.getDeletedAt())
                                .build()
                );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Deleted files fetched successfully",
                dtoPage
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>>
    restoreFiles(
            List<Long> fileIds
    ) {

        log.info(
                "Restore request for fileIds: {}",
                fileIds
        );

        if (fileIds == null || fileIds.isEmpty()) {

            throw new InvalidFileException(
                    "No files selected"
            );
        }

        User user = SecurityUtil.getCurrentUser();

        Set<Long> uniqueIds = new HashSet<>(fileIds);

        List<UserFile> files =
                fileRepository
                        .findAllByIdInAndUserIdAndIsDeletedTrue(
                                new ArrayList<>(uniqueIds),
                                user.getId()
                        );

        if (files.size() != uniqueIds.size()) {

            throw new FileNotFoundException(
                    "One or more files not found"
            );
        }

        for (UserFile file : files) {

            file.setIsDeleted(false);
            file.setDeletedAt(null);
        }

        fileRepository.saveAll(files);

        log.info(
                "{} file(s) restored successfully",
                files.size()
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files restored successfully",
                null
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<String>>
    permanentlyDeleteFiles(
            List<Long> fileIds
    ) throws IOException {

        log.info(
                "Permanent delete request for fileIds: {}",
                fileIds
        );

        if (fileIds == null || fileIds.isEmpty()) {

            throw new InvalidFileException(
                    "No files selected"
            );
        }

        User user = SecurityUtil.getCurrentUser();

        Set<Long> uniqueIds = new HashSet<>(fileIds);

        List<UserFile> files =
                fileRepository
                        .findAllByIdInAndUserIdAndIsDeletedTrue(
                                new ArrayList<>(uniqueIds),
                                user.getId()
                        );

        if (files.size() != uniqueIds.size()) {

            throw new FileNotFoundException(
                    "One or more files not found"
            );
        }

        long totalFreedStorage = 0;

        List<ShareHistory> historyList =
                new ArrayList<>();

        for (UserFile file : files) {

            // Fetch shares
            List<ShareLink> shares =
                    shareLinkRepository.findByFile(file);

            // Convert share -> history
            for (ShareLink share : shares) {

                historyList.add(
                        ShareHistory.builder()
                                .fileId(file.getId())
                                .fileName(file.getName())
                                .fileType(file.getType().name())
                                .fileSize(file.getSize())
                                .sharedByUserId(
                                        share.getCreatedBy().getId()
                                )
                                .sharedAt(
                                        share.getCreatedAt()
                                )
                                .deletedAt(LocalDateTime.now())
                                .build()
                );
            }

            // Delete shares
            shareLinkRepository.deleteAll(shares);

            // Delete actual file
//            Files.deleteIfExists(
//                    Paths.get(file.getPath())
//            );

            Path filePath = Paths.get(file.getPath());

            log.info("Deleting file: {}", filePath.toAbsolutePath());

            boolean deleted = Files.deleteIfExists(filePath);

            log.info("Deleted: {}", deleted);

            // Delete preview if exists
//            if (file.getPreviewPath() != null) {
//
//                Files.deleteIfExists(
//                        Paths.get(file.getPreviewPath())
//                );
//            }

            if (file.getPreviewPath() != null) {

                Path previewPath = Paths.get(
                        uploadDir,
                        file.getPreviewPath()
                ).normalize();

                log.info(
                        "Deleting preview: {}",
                        previewPath.toAbsolutePath()
                );

                boolean previewDeleted =
                        Files.deleteIfExists(previewPath);

                log.info(
                        "Preview deleted: {}",
                        previewDeleted
                );
            }

            totalFreedStorage += file.getSize();
        }

        // Save history
        shareHistoryRepository.saveAll(historyList);

        // Update storage once
        user.setStorageUsed(
                Math.max(
                        0,
                        user.getStorageUsed()
                                - totalFreedStorage
                )
        );

        userRepository.save(user);

        // Delete DB records
        fileRepository.permanentlyDeleteFiles(
                new ArrayList<>(uniqueIds),
                user.getId()
        );

        fileRepository.flush();

        log.info(
                "{} file(s) permanently deleted",
                files.size()
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Files permanently deleted",
                null
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<Map<String, Object>>>
    restoreAllFiles() {

        User user = SecurityUtil.getCurrentUser();

        List<UserFile> files =
                fileRepository
                        .findAllByUserIdAndIsDeletedTrue(
                                user.getId()
                        );

        for (UserFile file : files) {

            file.setIsDeleted(false);
            file.setDeletedAt(null);
        }

        fileRepository.saveAll(files);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "restoredCount",
                files.size()
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "All files restored successfully",
                response
        );
    }

    @Transactional
    public ResponseEntity<ResponseStructure<Map<String, Object>>>
    emptyRecycleBin() throws IOException {

        log.info("Empty recycle bin request received");

        User user = SecurityUtil.getCurrentUser();

        log.info(
                "Current user: {} (id={})",
                user.getEmail(),
                user.getId()
        );

        List<UserFile> files =
                fileRepository
                        .findAllByUserIdAndIsDeletedTrue(
                                user.getId()
                        );

        log.info(
                "{} deleted file(s) found in recycle bin",
                files.size()
        );

        long totalFreedStorage = 0;

        List<ShareHistory> historyList =
                new ArrayList<>();

        for (UserFile file : files) {

            log.info(
                    "Processing file: {} (id={})",
                    file.getName(),
                    file.getId()
            );

            // Fetch share links
            List<ShareLink> shares =
                    shareLinkRepository.findByFile(file);

            log.info(
                    "{} share link(s) found for file={}",
                    shares.size(),
                    file.getName()
            );

            // Save share history
            for (ShareLink share : shares) {

                historyList.add(
                        ShareHistory.builder()
                                .fileId(file.getId())
                                .fileName(file.getName())
                                .fileType(file.getType().name())
                                .fileSize(file.getSize())
                                .sharedByUserId(
                                        share.getCreatedBy().getId()
                                )
                                .sharedAt(
                                        share.getCreatedAt()
                                )
                                .deletedAt(LocalDateTime.now())
                                .build()
                );
            }

            // Delete share links
            shareLinkRepository.deleteAll(shares);

            log.info(
                    "Deleted {} share link(s) for file={}",
                    shares.size(),
                    file.getName()
            );

            // Delete actual file
            Path filePath =
                    Paths.get(file.getPath())
                            .normalize();

            log.info(
                    "Deleting physical file: {}",
                    filePath.toAbsolutePath()
            );

            boolean fileDeleted =
                    Files.deleteIfExists(filePath);

            log.info(
                    "Physical file deleted = {}",
                    fileDeleted
            );

            // Delete preview file
            if (file.getPreviewPath() != null) {

                Path previewPath =
                        Paths.get(
                                uploadDir,
                                file.getPreviewPath()
                        ).normalize();

                log.info(
                        "Deleting preview file: {}",
                        previewPath.toAbsolutePath()
                );

                boolean previewDeleted =
                        Files.deleteIfExists(
                                previewPath
                        );

                log.info(
                        "Preview deleted = {}",
                        previewDeleted
                );
            } else {

                log.info(
                        "No preview file for {}",
                        file.getName()
                );
            }

            totalFreedStorage +=
                    file.getSize();

            log.info(
                    "Freed {} bytes from file={}",
                    file.getSize(),
                    file.getName()
            );
        }

        // Save share history
        if (!historyList.isEmpty()) {

            shareHistoryRepository
                    .saveAll(historyList);

            log.info(
                    "{} share history record(s) saved",
                    historyList.size()
            );
        }

        // Delete DB records
        fileRepository.deleteRecycleBinFiles(
                user.getId()
        );

        fileRepository.flush();

        log.info(
                "Deleted recycle bin DB records for userId={}",
                user.getId()
        );

        // Update storage
        long oldStorage =
                user.getStorageUsed();

        long updatedStorage =
                Math.max(
                        0,
                        oldStorage
                                - totalFreedStorage
                );

        user.setStorageUsed(
                updatedStorage
        );

        userRepository.save(user);

        log.info(
                "Storage updated: {} -> {} bytes",
                oldStorage,
                updatedStorage
        );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "deletedCount",
                files.size()
        );

        response.put(
                "freedStorageBytes",
                totalFreedStorage
        );

        log.info(
                "Recycle bin cleared successfully. Deleted {} file(s)",
                files.size()
        );

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Recycle bin cleared successfully",
                response
        );
    }
    public ResponseEntity<ResponseStructure<RecycleBinStatsResponse>>
    getRecycleBinStats() {

        User user = SecurityUtil.getCurrentUser();

        List<UserFile> files =
                fileRepository
                        .findAllByUserIdAndIsDeletedTrue(
                                user.getId()
                        );

        int totalFiles = files.size();

        int expiringSoon = 0;

        long totalSizeBytes = 0;

        int retentionDays = 30;

        LocalDateTime now = LocalDateTime.now();

        for (UserFile file : files) {

            totalSizeBytes += file.getSize();

            if (file.getDeletedAt() != null) {

                long daysRemaining =
                        retentionDays
                                - ChronoUnit.DAYS.between(
                                file.getDeletedAt(),
                                now
                        );

                if (daysRemaining <= 5) {
                    expiringSoon++;
                }
            }
        }

        double spaceUsedMB =
                Math.round(
                        (totalSizeBytes / (1024.0 * 1024.0)) * 100.0
                ) / 100.0;

        RecycleBinStatsResponse response =
                RecycleBinStatsResponse.builder()
                        .totalFiles(totalFiles)
                        .expiringSoon(expiringSoon)
                        .spaceUsedMB(spaceUsedMB)
                        .retentionDays(retentionDays)
                        .build();

        return ResponseBuilder.build(
                HttpStatus.OK,
                "Recycle bin stats fetched",
                response
        );
    }
}
