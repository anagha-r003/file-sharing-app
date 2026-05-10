package com.rapidrise.filesharingapp.service;

import com.rapidrise.filesharingapp.dto.ResponseStructure;
import com.rapidrise.filesharingapp.dto.response.FileResponse;
import com.rapidrise.filesharingapp.entity.ShareHistory;
import com.rapidrise.filesharingapp.entity.ShareLink;
import com.rapidrise.filesharingapp.entity.User;
import com.rapidrise.filesharingapp.entity.UserFile;
import com.rapidrise.filesharingapp.exception.FileNotFoundException;
import com.rapidrise.filesharingapp.exception.InvalidFileException;
import com.rapidrise.filesharingapp.repository.FileRepository;
import com.rapidrise.filesharingapp.util.ResponseBuilder;
import com.rapidrise.filesharingapp.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecycleBinService {

    private final FileRepository fileRepository;

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

//    @Transactional
//    public ResponseEntity<ResponseStructure<String>>
//    permanentlyDeleteFiles(
//            List<Long> fileIds
//    ) throws IOException {
//
//        log.info(
//                "Permanent delete request for fileIds: {}",
//                fileIds
//        );
//
//        if (fileIds == null || fileIds.isEmpty()) {
//
//            throw new InvalidFileException(
//                    "No files selected"
//            );
//        }
//
//        User user = SecurityUtil.getCurrentUser();
//
//        Set<Long> uniqueIds = new HashSet<>(fileIds);
//
//        List<UserFile> files =
//                fileRepository
//                        .findAllByIdInAndUserIdAndIsDeletedTrue(
//                                new ArrayList<>(uniqueIds),
//                                user.getId()
//                        );
//
//        if (files.size() != uniqueIds.size()) {
//
//            throw new FileNotFoundException(
//                    "One or more files not found"
//            );
//        }
//
//        long totalFreedStorage = 0;
//
//        List<ShareHistory> historyList =
//                new ArrayList<>();
//
//        for (UserFile file : files) {
//
//            // Fetch shares
//            List<ShareLink> shares =
//                    shareLinkRepository.findByFile(file);
//
//            // Convert share -> history
//            for (ShareLink share : shares) {
//
//                historyList.add(
//                        ShareHistory.builder()
//                                .fileId(file.getId())
//                                .fileName(file.getName())
//                                .fileType(file.getType().name())
//                                .fileSize(file.getSize())
//                                .sharedBy(
//                                        share.getCreatedBy().getId()
//                                )
//                                .sharedAt(
//                                        share.getCreatedAt()
//                                )
//                                .deletedAt(LocalDateTime.now())
//                                .build()
//                );
//            }
//
//            // Delete shares
//            shareLinkRepository.deleteAll(shares);
//
//            // Delete actual file
//            Files.deleteIfExists(
//                    Paths.get(file.getPath())
//            );
//
//            // Delete preview if exists
//            if (file.getPreviewPath() != null) {
//
//                Files.deleteIfExists(
//                        Paths.get(file.getPreviewPath())
//                );
//            }
//
//            totalFreedStorage += file.getSize();
//        }
//
//        // Save history
//        shareHistoryRepository.saveAll(historyList);
//
//        // Update storage once
//        user.setStorageUsed(
//                Math.max(
//                        0,
//                        user.getStorageUsed()
//                                - totalFreedStorage
//                )
//        );
//
//        userRepository.save(user);
//
//        // Delete DB records
//        fileRepository.deleteAll(files);
//
//        log.info(
//                "{} file(s) permanently deleted",
//                files.size()
//        );
//
//        return ResponseBuilder.build(
//                HttpStatus.OK,
//                "Files permanently deleted",
//                null
//        );
//    }

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

//    @Transactional
//    public ResponseEntity<ResponseStructure<Map<String, Object>>>
//    emptyRecycleBin() throws IOException {
//
//        User user = SecurityUtil.getCurrentUser();
//
//        List<UserFile> files =
//                fileRepository
//                        .findByUserIdAndIsDeletedTrue(
//                                user.getId()
//                        );
//
//        long totalFreedStorage = 0;
//
//        List<ShareHistory> historyList =
//                new ArrayList<>();
//
//        for (UserFile file : files) {
//
//            List<ShareLink> shares =
//                    shareLinkRepository.findByFile(file);
//
//            for (ShareLink share : shares) {
//
//                historyList.add(
//                        ShareHistory.builder()
//                                .fileId(file.getId())
//                                .fileName(file.getName())
//                                .fileType(file.getType().name())
//                                .fileSize(file.getSize())
//                                .sharedBy(
//                                        share.getCreatedBy().getId()
//                                )
//                                .sharedAt(
//                                        share.getCreatedAt()
//                                )
//                                .deletedAt(LocalDateTime.now())
//                                .build()
//                );
//            }
//
//            shareLinkRepository.deleteAll(shares);
//
//            Files.deleteIfExists(
//                    Paths.get(file.getPath())
//            );
//
//            if (file.getPreviewPath() != null) {
//
//                Files.deleteIfExists(
//                        Paths.get(file.getPreviewPath())
//                );
//            }
//
//            totalFreedStorage += file.getSize();
//        }
//
//        shareHistoryRepository.saveAll(historyList);
//
//        fileRepository.deleteAll(files);
//
//        user.setStorageUsed(
//                Math.max(
//                        0,
//                        user.getStorageUsed()
//                                - totalFreedStorage
//                )
//        );
//
//        userRepository.save(user);
//
//        Map<String, Object> response =
//                new HashMap<>();
//
//        response.put(
//                "deletedCount",
//                files.size()
//        );
//
//        return ResponseBuilder.build(
//                HttpStatus.OK,
//                "Recycle bin cleared successfully",
//                response
//        );
//    }

//    public ResponseEntity<ResponseStructure<RecycleBinStatsResponse>>
//    getRecycleBinStats() {
//
//        User user = SecurityUtil.getCurrentUser();
//
//        List<UserFile> files =
//                fileRepository
//                        .findByUserIdAndIsDeletedTrue(
//                                user.getId()
//                        );
//
//        int totalFiles = files.size();
//
//        int expiringSoon = 0;
//
//        long totalSizeBytes = 0;
//
//        int retentionDays = 30;
//
//        LocalDateTime now = LocalDateTime.now();
//
//        for (UserFile file : files) {
//
//            totalSizeBytes += file.getSize();
//
//            if (file.getDeletedAt() != null) {
//
//                long daysRemaining =
//                        retentionDays
//                                - ChronoUnit.DAYS.between(
//                                file.getDeletedAt(),
//                                now
//                        );
//
//                if (daysRemaining <= 5) {
//                    expiringSoon++;
//                }
//            }
//        }
//
//        RecycleBinStatsResponse response =
//                RecycleBinStatsResponse.builder()
//                        .totalFiles(totalFiles)
//                        .expiringSoon(expiringSoon)
//                        .spaceUsedMB(
//                                totalSizeBytes
//                                        / (1024 * 1024)
//                        )
//                        .retentionDays(retentionDays)
//                        .build();
//
//        return ResponseBuilder.build(
//                HttpStatus.OK,
//                "Recycle bin stats fetched",
//                response
//        );
//    }
}
